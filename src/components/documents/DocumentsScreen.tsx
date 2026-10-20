import React, { useState } from 'react';
import { MedicalDocument } from '../../types';
import {
  FileText,
  Upload,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Download,
  Trash2,
  Sparkles,
  ExternalLink,
  Search,
  Filter,
} from 'lucide-react';
import { apiService } from '../../services/api';

interface DocumentsScreenProps {
  documents: MedicalDocument[];
  onSaveDocument: (doc: MedicalDocument) => void;
  onDeleteDocument: (id: string) => void;
  onExportSummary: () => void;
  onBack: () => void;
}

export const DocumentsScreen: React.FC<DocumentsScreenProps> = ({
  documents,
  onSaveDocument,
  onDeleteDocument,
  onExportSummary,
  onBack,
}) => {
  const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(documents[0] || null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredDocs = documents.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      d.provider.toLowerCase().includes(searchFilter.toLowerCase());
    const matchesType = filterType === 'all' || d.documentType === filterType;
    return matchesSearch && matchesType;
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const reader = new FileReader();

    reader.onload = async () => {
      const base64String = reader.result as string;

      try {
        const analysis = await apiService.analyzeDocument(
          base64String,
          file.type,
          file.name
        );

        const newDoc: MedicalDocument = {
          id: `doc_${Date.now()}`,
          title: file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
          documentType: analysis.documentType || 'Lab Report',
          provider: analysis.provider || 'Diagnostic Provider',
          date: analysis.date || new Date().toISOString().split('T')[0],
          fileName: file.name,
          fileSize: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          keyFindings: analysis.keyFindings || ['Extracted test result ready for doctor discussion'],
          plainLanguageSummary: analysis.plainLanguageSummary || 'Information extracted from document.',
          suggestedDoctorQuestions: analysis.suggestedDoctorQuestions || [
            'How do these results correlate with my daily fatigue symptoms?',
          ],
          unverified: true, // Marked as unverified until patient reviews
        };

        onSaveDocument(newDoc);
        setSelectedDoc(newDoc);
      } catch (err) {
        console.error('Failed to analyze document', err);
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsDataURL(file);
  };

  const handleVerifyDocument = (doc: MedicalDocument) => {
    const updated = { ...doc, unverified: false };
    onSaveDocument(updated);
    setSelectedDoc(updated);
  };

  return (
    <div className="pb-28 pt-2 px-4 max-w-xl mx-auto space-y-4 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex items-center justify-between py-2">
        <div>
          <h2 className="text-xl font-bold text-[#132A1F] font-display">Medical Vault & Health Timeline</h2>
          <p className="text-xs text-[#132A1F]/60">Preserve lab records, plain-language OCR summaries</p>
        </div>

        <button
          onClick={onBack}
          className="text-xs bg-[#E8EFE9] text-[#132A1F] px-3 py-1.5 rounded-full font-semibold"
        >
          Back
        </button>
      </div>

      {/* Upload Zone */}
      <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-[#132A1F]/20 text-center hover:border-[#132A1F]/40 transition-colors relative">
        <input
          type="file"
          accept=".pdf,image/*"
          onChange={handleFileUpload}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F] mb-2">
            <Upload className={`w-6 h-6 ${isUploading ? 'animate-bounce' : ''}`} />
          </div>
          <h4 className="text-sm font-bold text-[#132A1F]">
            {isUploading ? 'Analyzing Document with AI OCR...' : 'Upload Medical Document or Lab Report'}
          </h4>
          <p className="text-xs text-[#132A1F]/60 mt-1 max-w-xs">
            Supports PDF, JPG, and PNG files. Original files are preserved with unverified draft summaries.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#132A1F]/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search documents or providers..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full bg-white border border-[#132A1F]/15 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none"
          />
        </div>

        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white border border-[#132A1F]/15 rounded-xl px-2.5 py-2 text-xs text-[#132A1F] focus:outline-none"
        >
          <option value="all">All Types</option>
          <option value="Lab Report">Labs</option>
          <option value="Clinic Note">Notes</option>
          <option value="Imaging">Imaging</option>
          <option value="Prescription">Rx</option>
        </select>
      </div>

      {/* Document Detail Viewer */}
      {selectedDoc && (
        <div className="bg-[#FFFDF9] rounded-3xl p-5 border border-[#132A1F]/10 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#132A1F] text-white px-2 py-0.5 rounded-full font-semibold">
                  {selectedDoc.documentType}
                </span>
                {selectedDoc.unverified ? (
                  <span className="text-[10px] bg-[#FFE5D9] text-[#6B4435] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3 text-[#E76F51]" />
                    <span>Unverified — Pending Review</span>
                  </span>
                ) : (
                  <span className="text-[10px] bg-[#D8F3DC] text-[#1B4332] px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-[#2D6A4F]" />
                    <span>Verified by You</span>
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-[#132A1F] font-display mt-2">
                {selectedDoc.title}
              </h3>
              <p className="text-xs text-[#132A1F]/60 mt-0.5">
                {selectedDoc.provider} · Date: {selectedDoc.date}
              </p>
            </div>

            <button
              onClick={() => onDeleteDocument(selectedDoc.id)}
              className="text-[#132A1F]/40 hover:text-red-500 p-1 transition-colors"
              title="Delete Document"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Plain Language Summary */}
          <div className="bg-[#E8EFE9] rounded-2xl p-3.5 text-xs text-[#132A1F]/90 leading-relaxed">
            <div className="font-bold text-[#132A1F] flex items-center gap-1 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
              <span>Plain-Language Translation:</span>
            </div>
            {selectedDoc.plainLanguageSummary}
          </div>

          {/* Key Findings */}
          <div>
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
              Key Findings & Values
            </h4>
            <div className="space-y-1.5">
              {selectedDoc.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-[#132A1F]/10 rounded-xl p-2.5 text-xs text-[#132A1F]/80 flex items-start gap-2"
                >
                  <span className="text-[#2D6A4F] font-bold">•</span>
                  <span>{finding}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clinician Talking Points */}
          <div>
            <h4 className="text-xs font-bold text-[#132A1F] uppercase tracking-wider mb-2">
              Suggested Questions for Your Doctor
            </h4>
            <div className="space-y-1.5">
              {selectedDoc.suggestedDoctorQuestions.map((q, idx) => (
                <div
                  key={idx}
                  className="bg-[#FFE5D9]/40 border border-[#F4A261]/20 rounded-xl p-2.5 text-xs text-[#6B4435] flex items-start gap-2"
                >
                  <span className="font-bold">?</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Verification CTA */}
          {selectedDoc.unverified && (
            <div className="pt-2 flex items-center justify-between">
              <p className="text-[11px] text-[#132A1F]/60">
                Confirm that these extracted findings look accurate.
              </p>
              <button
                onClick={() => handleVerifyDocument(selectedDoc)}
                className="text-xs bg-[#2D6A4F] text-white px-3 py-1.5 rounded-full font-semibold hover:bg-[#1B4332] transition-colors"
              >
                Mark as Reviewed
              </button>
            </div>
          )}
        </div>
      )}

      {/* Document Library List */}
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-[#132A1F] font-display px-1">
          Stored Documents ({filteredDocs.length})
        </h3>
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            onClick={() => setSelectedDoc(doc)}
            className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
              selectedDoc?.id === doc.id
                ? 'bg-white border-[#132A1F] shadow-sm'
                : 'bg-white/80 border-[#132A1F]/10 hover:bg-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E8EFE9] flex items-center justify-center text-[#132A1F]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#132A1F]">{doc.title}</div>
                <div className="text-[10px] text-[#132A1F]/60">
                  {doc.provider} · {doc.date}
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] bg-[#F8F6F0] px-2 py-0.5 rounded-md text-[#132A1F]/70 font-medium">
                {doc.documentType}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
