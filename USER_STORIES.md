# Laboratory Tracking System User Stories

This document defines the core user stories for the prototype described in the thesis *Design of a Low-Cost Tool Accountability System for Electrical Laboratories Using Barcodes*. The stories focus only on the basic functions explicitly covered by the study for selected commonly used electrical laboratory tools.

## 1. Tool Identification and Barcode Preparation

**Goal:** Ensure each selected laboratory tool has a unique identity that can be tracked digitally and physically.

### User Stories

1. As a laboratory staff member, I want selected commonly used electrical laboratory tools to have individual digital records so that each tool can be tracked during borrowing and returning.
2. As a laboratory staff member, I want each tool to be assigned a unique barcode so that the system can identify the correct tool during scanning.
3. As a laboratory staff member, I want to generate barcode labels using free barcode generation software and print them using standard printers so that the system remains low cost.
4. As a laboratory staff member, I want barcode labels to be attached to physical tools so that each physical item is directly linked to its digital record.
5. As a laboratory staff member, I want damaged barcode labels to be replaced without changing the tool's identity in the system so that tracking can continue reliably.

### Acceptance Points

- Each selected tool has a unique barcode linked to one digital record.
- Barcode labels are printed and attached to the physical tools.
- Tool details are stored in a spreadsheet reference table for lookup during transactions.

## 2. Borrower Recording

**Goal:** Record the borrower in a simple way that supports accountability during tool use.

### User Stories

1. As a laboratory staff member, I want the borrower's name to be recorded in the transaction entry so that responsibility for borrowed tools can be traced.
2. As a student borrower, I want the recording process to follow existing laboratory routines so that I can use the system without special training.
3. As a laboratory instructor, I want borrower details to be captured in a clear digital record so that I can review who used a tool when needed.

### Acceptance Points

- Borrower name is included in the transaction record.
- Borrower information supports accountability during review of tool usage.
- The recording process remains simple and easy to follow.

## 3. Barcode Scanning and Spreadsheet Retrieval

**Goal:** Use low-cost barcode scanning to reduce manual encoding and speed up tool identification.

### User Stories

1. As a laboratory staff member, I want a low-cost handheld barcode scanner connected through USB to send barcode values directly to a computer so that manual encoding is reduced.
2. As a laboratory staff member, I want scanned barcode values to be received by the spreadsheet application as text input so that the spreadsheet can process the transaction immediately.
3. As a laboratory staff member, I want lookup functions to retrieve tool information from the reference table when a barcode is scanned so that the correct tool details appear in the transaction record.

### Acceptance Points

- The barcode scanner transmits the scanned value as text input through USB.
- The spreadsheet receives the scanned value and processes it using built-in functions.
- Tool information is retrieved from the reference table during scanning.

## 4. Borrowing and Returning Status Logic

**Goal:** Determine tool movement automatically using spreadsheet formulas and logical rules.

### User Stories

1. As a laboratory staff member, I want the spreadsheet to check the current status of a tool when it is scanned so that the correct transaction action is determined automatically.
2. As a laboratory staff member, I want an available tool to be recorded as borrowed when its barcode is scanned so that the system reflects that the tool is in use.
3. As a laboratory staff member, I want the same barcode to record a return when the tool is scanned again so that the tool status is updated correctly.

### Acceptance Points

- If a tool is currently `Available`, the scan records it as `Borrowed`.
- If the same barcode is scanned again after borrowing, the system records the return and updates the status.
- Status processing relies on spreadsheet formulas and simple logical rules.

## 5. Digital Logging of Transactions

**Goal:** Replace manual logbook recording with a digital transaction record.

### User Stories

1. As a laboratory staff member, I want each barcode transaction to create a digital record so that tool movement is documented electronically instead of by handwritten logbook.
2. As a laboratory staff member, I want the transaction record to include tool information, borrower name, date, time, and borrowing or returning status so that I can review accurate records later.
3. As a laboratory instructor, I want digital records to reduce incomplete and unclear entries so that monitoring becomes faster and more reliable.

### Acceptance Points

- Scanning records tool information in a digital log.
- The transaction record includes borrower name, date, time, and status.
- Digital logging improves clarity and reduces common manual recording errors.

## 6. Tool Status Monitoring and Accountability

**Goal:** Make the current condition of tools easy to monitor using spreadsheet-based indicators.

### User Stories

1. As a laboratory staff member, I want the spreadsheet to visually indicate which tools are borrowed and which are available so that I can check status quickly.
2. As a laboratory staff member, I want missing or unreturned tools to be identified by filtering records based on status and date so that responsibility can be determined more easily.
3. As a laboratory instructor, I want the system to help me review overdue or not yet returned tools so that I can follow up during laboratory operations.

### Acceptance Points

- Conditional formatting visually indicates borrowed and available tools.
- Filtering by status and date helps identify unreturned tools.
- Current tool status can be reviewed quickly within the spreadsheet.

## 7. Validation and Record Accuracy

**Goal:** Support accurate records using simple spreadsheet-based controls.

### User Stories

1. As a laboratory staff member, I want the spreadsheet to use simple validation mechanisms so that duplicate or incorrect entries can be reduced.
2. As a laboratory staff member, I want barcode scanning and spreadsheet rules to minimize manual recording errors so that tool tracking remains reliable.

### Acceptance Points

- Simple validation mechanisms help reduce duplicate or incorrect entries.
- Barcode scanning reduces manual encoding errors.
- Spreadsheet rules support more accurate transaction records.

## 8. Simple Spreadsheet-Based Use

**Goal:** Keep the system affordable, practical, and easy to adopt in an electrical laboratory.

### User Stories

1. As a laboratory staff member, I want the prototype to run through a spreadsheet application so that the system remains affordable and easy to deploy.
2. As a school administrator, I want the system to use standard printers, a USB barcode scanner, and existing computer software so that implementation costs remain low.
3. As a laboratory user, I want the system to fit existing laboratory routines without requiring advanced software or special technical training.

### Acceptance Points

- The spreadsheet serves as the central processing and storage tool of the prototype.
- The system avoids complex databases and custom software development.
- The workflow remains simple, low cost, and suitable for public college laboratory use.

## Scope Notes

These user stories reflect only the functions described in the thesis prototype. The scope is limited to selected commonly used electrical laboratory tools and excludes advanced features such as wireless tracking, real-time location monitoring, automated notifications, RFID, mobile applications, biometric systems, and integration with online databases.
