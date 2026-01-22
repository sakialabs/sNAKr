"""
Receipt processing tasks.
"""
from celery_app import app


@app.task(name="tasks.receipt_processing.process_receipt")
def process_receipt(receipt_id: str):
    """
    Process a receipt: OCR, parse, extract items, update inventory.
    
    Args:
        receipt_id: UUID of the receipt to process
    """
    # TODO: Implement receipt processing pipeline
    # 1. Download receipt from MinIO
    # 2. Run OCR (Tesseract)
    # 3. Parse receipt text
    # 4. Extract items
    # 5. Map to inventory items
    # 6. Update inventory
    # 7. Update receipt status
    pass


@app.task(name="tasks.receipt_processing.ocr_receipt")
def ocr_receipt(receipt_id: str):
    """
    Run OCR on a receipt image.
    
    Args:
        receipt_id: UUID of the receipt to process
    """
    # TODO: Implement OCR
    pass
