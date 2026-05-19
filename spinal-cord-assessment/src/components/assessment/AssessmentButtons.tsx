"use client";

type Props = {
    onExportPDF: () => void;
    onSaveDraft: () => void;
    onSaveFinal: () => void;
};

export default function AssessmentButtons({
    onExportPDF,
    onSaveDraft,
    onSaveFinal,
}: Props) {

    return (
        <div className="flex justify-end gap-4 mt-6">

            <button onClick={onExportPDF}>
                Export PDF
            </button>

            <button onClick={onSaveDraft}>
                Save Draft
            </button>

            <button onClick={onSaveFinal}>
                Save Final
            </button>

        </div>
    );

    
}