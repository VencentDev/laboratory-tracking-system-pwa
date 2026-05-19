import { createServer } from "node:http";
import { writeFile, unlink } from "node:fs/promises";
import { existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";

const PORT = Number.parseInt(process.env.PRINT_BRIDGE_PORT ?? "9321", 10);
const HOST = process.env.PRINT_BRIDGE_HOST ?? "127.0.0.1";
const TARGET = process.env.PRINT_BRIDGE_TARGET ?? "auto";
const LINUX_DEVICE = process.env.PRINT_BRIDGE_DEVICE ?? "/dev/usb/lp0";
const WINDOWS_PRINTER_NAME = process.env.PRINT_BRIDGE_PRINTER_NAME ?? "POS-58";
const SHOULD_CUT = process.env.PRINT_BRIDGE_CUT === "1";
const MAX_BODY_BYTES = Number.parseInt(process.env.PRINT_BRIDGE_MAX_BODY_BYTES ?? "65536", 10);
const ALLOWED_ORIGINS = parseAllowedOrigins(process.env.PRINT_BRIDGE_ALLOWED_ORIGINS);
const WINDOWS_RAW_PRINT_SCRIPT = String.raw`param(
  [Parameter(Mandatory = $true)]
  [string] $PrinterName,

  [Parameter(Mandatory = $true)]
  [string] $Path
)

Add-Type -TypeDefinition @"
using System;
using System.IO;
using System.Runtime.InteropServices;

public class RawPrinterHelper {
  [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Ansi)]
  public class DOCINFOA {
    [MarshalAs(UnmanagedType.LPStr)]
    public string pDocName;
    [MarshalAs(UnmanagedType.LPStr)]
    public string pOutputFile;
    [MarshalAs(UnmanagedType.LPStr)]
    public string pDataType;
  }

  [DllImport("winspool.Drv", EntryPoint = "OpenPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool OpenPrinter(string szPrinter, out IntPtr hPrinter, IntPtr pd);

  [DllImport("winspool.Drv", EntryPoint = "ClosePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool ClosePrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "StartDocPrinterA", SetLastError = true, CharSet = CharSet.Ansi, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool StartDocPrinter(IntPtr hPrinter, Int32 level, [In, MarshalAs(UnmanagedType.LPStruct)] DOCINFOA di);

  [DllImport("winspool.Drv", EntryPoint = "EndDocPrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool EndDocPrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "StartPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool StartPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "EndPagePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool EndPagePrinter(IntPtr hPrinter);

  [DllImport("winspool.Drv", EntryPoint = "WritePrinter", SetLastError = true, ExactSpelling = true, CallingConvention = CallingConvention.StdCall)]
  public static extern bool WritePrinter(IntPtr hPrinter, byte[] pBytes, Int32 dwCount, out Int32 dwWritten);

  public static void SendFileToPrinter(string printerName, string filePath) {
    IntPtr printerHandle;
    if (!OpenPrinter(printerName.Normalize(), out printerHandle, IntPtr.Zero)) {
      throw new Exception("Could not open printer: " + printerName);
    }

    try {
      DOCINFOA docInfo = new DOCINFOA();
      docInfo.pDocName = "Laboratory Receipt";
      docInfo.pDataType = "RAW";

      if (!StartDocPrinter(printerHandle, 1, docInfo)) {
        throw new Exception("Could not start raw print job.");
      }

      try {
        if (!StartPagePrinter(printerHandle)) {
          throw new Exception("Could not start print page.");
        }

        try {
          byte[] bytes = File.ReadAllBytes(filePath);
          Int32 written;
          if (!WritePrinter(printerHandle, bytes, bytes.Length, out written)) {
            throw new Exception("Could not write raw bytes to printer.");
          }
        } finally {
          EndPagePrinter(printerHandle);
        }
      } finally {
        EndDocPrinter(printerHandle);
      }
    } finally {
      ClosePrinter(printerHandle);
    }
  }
}
"@

[RawPrinterHelper]::SendFileToPrinter($PrinterName, $Path)
`;

const server = createServer(async (request, response) => {
  setCorsHeaders(request, response);

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  if (request.method === "GET" && request.url === "/health") {
    sendJson(response, 200, {
      ok: true,
      target: resolveTarget(),
      linuxDevice: LINUX_DEVICE,
      windowsPrinterName: WINDOWS_PRINTER_NAME || null,
    });
    return;
  }

  if (request.method === "POST" && request.url === "/print") {
    try {
      const payload = await readJson(request);
      const content = typeof payload.content === "string" ? payload.content : "";

      if (!content.trim()) {
        sendJson(response, 400, { ok: false, error: "Missing receipt content" });
        return;
      }

      await printReceipt(content);
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 500, {
        ok: false,
        error: error instanceof Error ? error.message : "Print failed",
      });
    }
    return;
  }

  sendJson(response, 404, { ok: false, error: "Not found" });
});

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${PORT} is already in use on ${HOST}.`);
    console.error("Another print bridge may already be running.");
    console.error(`Check it with: curl http://${HOST}:${PORT}/health`);
    console.error("Or start this bridge on another port:");
    console.error("PRINT_BRIDGE_PORT=9322 pnpm print-bridge");
    process.exit(1);
  }

  console.error(error);
  process.exit(1);
});

server.listen(PORT, HOST, () => {
  console.log(`Laboratory print bridge listening on http://${HOST}:${PORT}`);
  console.log(`Target: ${resolveTarget()}`);
});

async function printReceipt(content) {
  const target = resolveTarget();
  const bytes = buildEscPosReceipt(content);

  if (target === "linux-device") {
    await writeFile(LINUX_DEVICE, bytes);
    return;
  }

  if (target === "windows-queue") {
    await printWindowsRaw(bytes);
    return;
  }

  if (target === "file") {
    const outputPath = process.env.PRINT_BRIDGE_FILE ?? join(process.cwd(), "receipt-print.bin");
    await writeFile(outputPath, bytes);
    console.log(`Wrote receipt bytes to ${outputPath}`);
    return;
  }

  throw new Error(`Unsupported print target: ${target}`);
}

function resolveTarget() {
  if (TARGET !== "auto") {
    return TARGET;
  }

  if (process.platform === "win32") {
    return "windows-queue";
  }

  return "linux-device";
}

function buildEscPosReceipt(content) {
  const normalizedContent = content.replace(/\r?\n/g, "\n");
  const chunks = [
    Buffer.from([0x1b, 0x40]),
    Buffer.from(normalizedContent, "utf8"),
    Buffer.from("\n\n\n", "utf8"),
  ];

  if (SHOULD_CUT) {
    chunks.push(Buffer.from([0x1d, 0x56, 0x41, 0x00]));
  }

  return Buffer.concat(chunks);
}

async function printWindowsRaw(bytes) {
  if (!WINDOWS_PRINTER_NAME) {
    throw new Error("Set PRINT_BRIDGE_PRINTER_NAME to the installed Windows printer name");
  }

  const receiptPath = join(tmpdir(), `laboratory-receipt-${randomUUID()}.bin`);
  await writeFile(receiptPath, bytes);

  try {
    const scriptPath = await getWindowsRawPrintScriptPath();
    await runCommand("powershell.exe", [
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      scriptPath,
      "-PrinterName",
      WINDOWS_PRINTER_NAME,
      "-Path",
      receiptPath,
    ]);
  } finally {
    await unlink(receiptPath).catch(() => undefined);
  }
}

async function getWindowsRawPrintScriptPath() {
  if (!process.pkg) {
    const sourcePath = fileURLToPath(new URL("./windows-raw-print.ps1", import.meta.url));
    return sourcePath;
  }

  const scriptPath = join(tmpdir(), "laboratory-windows-raw-print.ps1");
  await writeFile(scriptPath, WINDOWS_RAW_PRINT_SCRIPT);
  return scriptPath;
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      windowsHide: true,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve(stdout);
        return;
      }

      reject(new Error(stderr.trim() || `${command} exited with code ${code}`));
    });
  });
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    let receivedBytes = 0;

    request.on("data", (chunk) => {
      receivedBytes += chunk.length;

      if (receivedBytes > MAX_BODY_BYTES) {
        reject(new Error("Request body is too large"));
        request.destroy();
        return;
      }

      body += chunk.toString();
    });

    request.on("end", () => {
      try {
        resolve(JSON.parse(body || "{}"));
      } catch {
        reject(new Error("Invalid JSON body"));
      }
    });

    request.on("error", reject);
  });
}

function parseAllowedOrigins(value) {
  if (!value || value === "*") {
    return ["*"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function setCorsHeaders(request, response) {
  const origin = request.headers.origin;
  const allowAnyOrigin = ALLOWED_ORIGINS.includes("*");
  const allowedOrigin = origin && (allowAnyOrigin || ALLOWED_ORIGINS.includes(origin)) ? origin : "*";

  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "Content-Type");
  response.setHeader("Access-Control-Allow-Private-Network", "true");
  response.setHeader("Vary", "Origin");
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
  });
  response.end(JSON.stringify(payload));
}

if (resolveTarget() === "linux-device" && !existsSync(LINUX_DEVICE)) {
  console.warn(`Warning: ${LINUX_DEVICE} does not exist yet. Connect the printer before printing.`);
}
