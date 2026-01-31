from pydantic import BaseModel, Field
from typing import List


class PrescriptionItem(BaseModel):
    medicine: str = Field(description="Name of the medicine")
    dosage: str = Field(description="Dosage instructions")
    instructions: str = Field(description="Administration instructions")


class Prescription(BaseModel):
    diagnosis: str = Field(description="Medical diagnosis")
    notes: str = Field(description="Additional notes for the patient")
    prescription_items: List[PrescriptionItem] = Field(
        description="List of prescribed medicines"
    )
