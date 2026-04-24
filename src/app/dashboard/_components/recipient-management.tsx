"use client";

import { useState } from "react";
import { FiUpload, FiPlus, FiSave, FiEdit2, FiTrash2, FiFileText, FiX, FiCheck, FiSearch, FiFilter, FiChevronLeft, FiChevronRight, FiCheckSquare, FiSquare, FiLoader } from "react-icons/fi";
import Papa from "papaparse";
import { createClient } from "@/lib/supabase/client";

type RecipientStatus = "Active" | "Inactive";

interface RecipientRow {
  id: string;
  status: RecipientStatus;
  attributes: Record<string, string>;
}

interface SavedFile {
  id: string;
  name: string;
  rows: RecipientRow[];
  headers: string[]; // Standard ("Name", "Email") + custom
  createdAt: Date;
  isNew?: boolean;
}

export function RecipientManagement({ initialLists = [] }: { initialLists?: (Omit<SavedFile, "createdAt"> & { created_at: string | Date })[] }) {
  const [savedFiles, setSavedFiles] = useState<SavedFile[]>(
    initialLists.map((list) => ({
      id: list.id,
      name: list.name,
      rows: list.rows || [],
      headers: list.headers || [],
      createdAt: new Date(list.created_at),
    }))
  );
  const [currentFile, setCurrentFile] = useState<SavedFile | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();
  
  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSavePrompt, setShowSavePrompt] = useState(false);
  const [tempData, setTempData] = useState<{ headers: string[], rows: RecipientRow[] } | null>(null);
  const [newFileName, setNewFileName] = useState("");

  // Table state
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  // New Attribute State
  const [showAddAttribute, setShowAddAttribute] = useState(false);
  const [newAttributeName, setNewAttributeName] = useState("");

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
    }, 100);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        setTimeout(() => {
          setIsUploading(false);
          const rawHeaders = results.meta.fields || [];
          
          // Map headers to standard Name/Email if possible
          const headers = new Set<string>();
          const nameKey = rawHeaders.find(h => h.toLowerCase() === 'name') || 'Name';
          const emailKey = rawHeaders.find(h => h.toLowerCase() === 'email') || 'Email';
          
          headers.add("Name");
          headers.add("Email");
          
          rawHeaders.forEach(h => {
            if (h !== nameKey && h !== emailKey) headers.add(h);
          });

          const rows: RecipientRow[] = (results.data as Record<string, string>[]).map((row) => {
            const email = row[emailKey] || "";
            const name = row[nameKey] || "";
            const attributes: Record<string, string> = { Name: name, Email: email };
            
            rawHeaders.forEach(h => {
              if (h !== nameKey && h !== emailKey) {
                attributes[h] = row[h] || "";
              }
            });

            return {
              id: crypto.randomUUID(),
              status: isValidEmail(email) ? "Active" : "Inactive",
              attributes
            };
          });

          setTempData({ headers: Array.from(headers), rows });
          setNewFileName(file.name.replace(".csv", ""));
          setShowSavePrompt(true);
        }, 500);
      },
      error: (error) => {
        console.error("Error parsing CSV:", error);
        clearInterval(progressInterval);
        setIsUploading(false);
        alert("Failed to parse CSV file.");
      }
    });
  };

  const handleOpenFile = async () => {
    if (!tempData) return;
    
    const newFile: SavedFile = {
      id: crypto.randomUUID(),
      name: newFileName || "Untitled CSV",
      rows: tempData.rows,
      headers: tempData.headers,
      createdAt: new Date(),
      isNew: true,
    };

    setCurrentFile(newFile);
    setShowSavePrompt(false);
    setTempData(null);
    resetTableState();
  };

  const handleAddManually = () => {
    const newFile: SavedFile = {
      id: crypto.randomUUID(),
      name: "New Recipient List",
      rows: [],
      headers: ["Name", "Email"],
      createdAt: new Date(),
      isNew: true,
    };
    
    setCurrentFile(newFile);
    resetTableState();
  };

  const saveCurrentFileChanges = async () => {
    if (!currentFile) return;
    
    setIsSaving(true);
    
    if (currentFile.isNew) {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        setIsSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("recipient_lists")
        .insert({
          user_id: userData.user.id,
          name: currentFile.name,
          rows: currentFile.rows,
          headers: currentFile.headers,
        })
        .select()
        .single();

      setIsSaving(false);

      if (error) {
        console.error("Error saving list:", error);
        alert("Failed to save the list.");
        return;
      }

      const savedFile: SavedFile = {
        id: data.id,
        name: data.name,
        rows: data.rows,
        headers: data.headers,
        createdAt: new Date(data.created_at),
        isNew: false,
      };

      setSavedFiles([savedFile, ...savedFiles]);
      setCurrentFile(savedFile);
    } else {
      const { error } = await supabase
        .from("recipient_lists")
        .update({
          name: currentFile.name,
          rows: currentFile.rows,
          headers: currentFile.headers,
          updated_at: new Date().toISOString()
        })
        .eq("id", currentFile.id);
        
      setIsSaving(false);
      
      if (error) {
        console.error("Error updating list:", error);
        alert("Failed to save changes.");
      } else {
        setSavedFiles(savedFiles.map(f => f.id === currentFile.id ? currentFile : f));
      }
    }
  };

  const deleteSavedFile = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this list?")) return;
    
    const { error } = await supabase
      .from("recipient_lists")
      .delete()
      .eq("id", id);
      
    if (error) {
      console.error("Error deleting list:", error);
      alert("Failed to delete list.");
      return;
    }
    
    setSavedFiles(savedFiles.filter(f => f.id !== id));
    if (currentFile?.id === id) {
      setCurrentFile(null);
    }
  };

  const handleAddRow = () => {
    if (!currentFile) return;
    
    const attributes: Record<string, string> = {};
    currentFile.headers.forEach(h => attributes[h] = "");
    
    const newRow: RecipientRow = {
      id: crypto.randomUUID(),
      status: "Inactive", // Invalid email initially
      attributes
    };

    updateCurrentFile({
      rows: [...currentFile.rows, newRow]
    });
  };

  const handleAddAttribute = () => {
    if (!currentFile || !newAttributeName.trim()) return;
    
    const name = newAttributeName.trim();
    if (currentFile.headers.includes(name)) return; // prevent duplicates

    const newRows = currentFile.rows.map(row => ({
      ...row,
      attributes: { ...row.attributes, [name]: "" }
    }));

    updateCurrentFile({
      headers: [...currentFile.headers, name],
      rows: newRows
    });
    
    setShowAddAttribute(false);
    setNewAttributeName("");
  };

  const updateCurrentFile = (updates: Partial<SavedFile>) => {
    if (!currentFile) return;
    const updated = { ...currentFile, ...updates };
    setCurrentFile(updated);
    setSavedFiles(savedFiles.map(f => f.id === updated.id ? updated : f));
  };

  const updateRowAttribute = (rowId: string, header: string, value: string) => {
    if (!currentFile) return;
    const newRows = currentFile.rows.map(row => {
      if (row.id === rowId) {
        const newAttributes = { ...row.attributes, [header]: value };
        // Re-validate email if it changed
        let status = row.status;
        if (header === "Email") {
          status = isValidEmail(value) ? "Active" : "Inactive";
        }
        return { ...row, attributes: newAttributes, status };
      }
      return row;
    });
    updateCurrentFile({ rows: newRows });
  };

  const toggleRowStatus = (rowId: string) => {
    if (!currentFile) return;
    const newRows = currentFile.rows.map(row => {
      if (row.id === rowId) {
        return { ...row, status: row.status === "Active" ? "Inactive" : "Active" as RecipientStatus };
      }
      return row;
    });
    updateCurrentFile({ rows: newRows });
  };

  const deleteRow = (rowId: string) => {
    if (!currentFile) return;
    updateCurrentFile({ rows: currentFile.rows.filter(r => r.id !== rowId) });
    const newSelected = new Set(selectedRowIds);
    newSelected.delete(rowId);
    setSelectedRowIds(newSelected);
  };

  // Bulk Actions
  const handleBulkStatusChange = (status: RecipientStatus) => {
    if (!currentFile) return;
    const newRows = currentFile.rows.map(row => 
      selectedRowIds.has(row.id) ? { ...row, status } : row
    );
    updateCurrentFile({ rows: newRows });
    setSelectedRowIds(new Set()); // optional: keep selected?
  };

  const handleBulkDelete = () => {
    if (!currentFile) return;
    const newRows = currentFile.rows.filter(row => !selectedRowIds.has(row.id));
    updateCurrentFile({ rows: newRows });
    setSelectedRowIds(new Set());
  };

  const toggleSelectAll = () => {
    if (selectedRowIds.size === filteredRows.length) {
      setSelectedRowIds(new Set());
    } else {
      setSelectedRowIds(new Set(filteredRows.map(r => r.id)));
    }
  };

  const toggleSelectRow = (rowId: string) => {
    const newSelected = new Set(selectedRowIds);
    if (newSelected.has(rowId)) newSelected.delete(rowId);
    else newSelected.add(rowId);
    setSelectedRowIds(newSelected);
  };

  const resetTableState = () => {
    setSelectedRowIds(new Set());
    setSearchQuery("");
    setCurrentPage(1);
  };

  // Derived State
  const filteredRows = currentFile ? (searchQuery ? currentFile.rows.filter(row => 
      Object.values(row.attributes).some(val => val.toLowerCase().includes(searchQuery.toLowerCase()))
    ) : currentFile.rows) : [];

  const paginatedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, (currentPage - 1) * rowsPerPage + rowsPerPage);

  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  if (currentFile) {
    const isAllSelected = filteredRows.length > 0 && selectedRowIds.size === filteredRows.length;
    const isIndeterminate = selectedRowIds.size > 0 && selectedRowIds.size < filteredRows.length;

    return (
      <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{currentFile.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{currentFile.rows.length} recipients • Uploaded on {currentFile.createdAt.toLocaleDateString()}</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentFile(null)}
                className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button 
                onClick={saveCurrentFileChanges}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-70"
              >
                {isSaving ? <FiLoader className="w-4 h-4 animate-spin" /> : <FiSave className="w-4 h-4" />}
                Save Data
              </button>
            </div>
          </div>
        </div>

        {/* Top Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex-shrink-0">
          {selectedRowIds.size > 0 ? (
            <div className="flex items-center justify-between h-10">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-md">
                  {selectedRowIds.size} selected
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <button 
                  onClick={() => handleBulkStatusChange("Active")}
                  className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                >
                  Set Active
                </button>
                <button 
                  onClick={() => handleBulkStatusChange("Inactive")}
                  className="text-sm font-medium text-gray-700 hover:text-orange-600 transition-colors"
                >
                  Set Inactive
                </button>
              </div>
              <button 
                onClick={handleBulkDelete}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 className="w-4 h-4" />
                Delete Selected
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 h-10">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-500 font-medium">Total: {currentFile.rows.length}</span>
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search recipients..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 w-64 bg-white shadow-sm"
                  />
                </div>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 shadow-sm">
                  <FiFilter className="w-4 h-4" />
                  Filter
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={handleAddRow}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                >
                  <FiPlus className="w-4 h-4" />
                  Add Row
                </button>
                
                {/* Add Attribute Popover/Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowAddAttribute(!showAddAttribute)}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg hover:bg-indigo-100 transition-colors shadow-sm"
                  >
                    <FiPlus className="w-4 h-4" />
                    Add Column
                  </button>
                  {showAddAttribute && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-4 z-20">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Add Custom Attribute</h4>
                      <input
                        type="text"
                        value={newAttributeName}
                        onChange={(e) => setNewAttributeName(e.target.value)}
                        placeholder="Column name"
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 mb-3"
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setShowAddAttribute(false)} className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900">Cancel</button>
                        <button onClick={handleAddAttribute} className="px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto relative">
          <table className="w-full text-left border-collapse min-w-max">
            <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-6 py-4 w-12 border-b border-gray-200">
                  <input 
                    type="checkbox"
                    checked={isAllSelected}
                    ref={el => { if (el) el.indeterminate = isIndeterminate; }}
                    onChange={toggleSelectAll}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-24">
                  Action
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 w-32">
                  Status
                </th>
                {currentFile.headers.map((header) => (
                  <th key={header} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200 min-w-[150px]">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {paginatedRows.map((row) => {
                const isSelected = selectedRowIds.has(row.id);
                return (
                  <tr key={row.id} className={`hover:bg-gray-50/50 transition-colors ${isSelected ? 'bg-indigo-50/30' : ''}`}>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <input 
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectRow(row.id)}
                        className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-600 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <button onClick={() => deleteRow(row.id)} className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors">
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap">
                      <button 
                        onClick={() => toggleRowStatus(row.id)}
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer transition-colors border ${
                          row.status === "Active" 
                            ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" 
                            : "bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${row.status === "Active" ? "bg-green-500" : "bg-orange-500"}`}></span>
                        {row.status}
                      </button>
                    </td>
                    {currentFile.headers.map((header) => (
                      <td key={`${row.id}-${header}`} className="px-6 py-3 text-sm text-gray-700 group">
                        <input 
                          type="text"
                          value={row.attributes[header] || ""}
                          onChange={(e) => updateRowAttribute(row.id, header, e.target.value)}
                          className={`w-full bg-transparent border border-transparent rounded px-2 py-1 -ml-2 focus:bg-white focus:border-indigo-300 focus:ring-2 focus:ring-indigo-600/20 focus:outline-none transition-all ${
                            !row.attributes[header] ? "italic text-gray-400" : ""
                          }`}
                          placeholder={`Enter ${header.toLowerCase()}...`}
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
              {paginatedRows.length === 0 && (
                <tr>
                  <td colSpan={currentFile.headers.length + 3} className="px-6 py-16 text-center text-gray-500 bg-gray-50/50">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                        <FiFileText className="w-6 h-6 text-gray-400" />
                      </div>
                      <p className="text-base font-medium text-gray-900 mb-1">No recipients found</p>
                      <p className="text-sm text-gray-500 mb-4">Add a new row or clear your search filters.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          
          {/* Manual Add Row Button at bottom center */}
          {paginatedRows.length > 0 && (
            <div className="sticky bottom-0 left-0 right-0 py-4 bg-gradient-to-t from-white via-white to-transparent flex justify-center z-10 pointer-events-none">
              <button 
                onClick={handleAddRow}
                className="pointer-events-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <FiPlus className="w-4 h-4 text-indigo-600" />
                Add New Row
              </button>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <div className="flex items-center gap-4">

            <div className="flex items-center gap-2 text-sm text-gray-500">
              <label htmlFor="rowsPerPage">Rows per page:</label>
              <select
                id="rowsPerPage"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-white border border-gray-200 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 cursor-pointer"
              >
                {[10, 20, 50, 100].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1} 
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <FiChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center px-2 text-sm font-medium text-gray-700">
              {currentPage} / {totalPages}
            </div>
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages} 
              className="p-1 text-gray-500 hover:bg-gray-100 rounded-md disabled:opacity-50 disabled:hover:bg-transparent transition-colors"
            >
              <FiChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* List Header */}
      {savedFiles.length > 0 && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Recipient Lists</h2>
            <p className="mt-1 text-sm text-gray-500">Manage and organize your recipient data</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer shadow-sm">
              <FiUpload className="w-4 h-4" />
              Upload CSV
              <input 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload}
              />
            </label>
            <button 
              onClick={handleAddManually}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <FiPlus className="w-4 h-4" />
              Add Manually
            </button>
          </div>
        </div>
      )}

      {/* Empty State / Upload Section */}
      {savedFiles.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50 hover:bg-gray-100/50 transition-colors">
          <div className="flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-sm mb-4">
            <FiUpload className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Recipients</h3>
          <p className="text-gray-500 text-center mb-6 max-w-md">
            Upload a CSV file containing your recipients&apos; data. We&apos;ll automatically match the headers for you.
          </p>
          
          {isUploading ? (
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-sm font-medium text-gray-700">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-indigo-600 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex gap-4">
              <label className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer shadow-sm">
                <FiUpload className="w-4 h-4" />
                Upload CSV
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  onChange={handleFileUpload}
                />
              </label>
              <button 
                onClick={handleAddManually}
                className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
              >
                <FiPlus className="w-4 h-4" />
                Add Manually
              </button>
            </div>
          )}
        </div>
      )}

      {/* Save File Prompt Modal */}
      {showSavePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Open Uploaded File</h3>
                <button onClick={() => { setShowSavePrompt(false); setTempData(null); }} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Successfully parsed {tempData?.rows.length} rows. Please provide a name for this list to open it.
              </p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">List Name</label>
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                    placeholder="e.g., Marketing Team 2024"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-100">
              <button
                onClick={() => { setShowSavePrompt(false); setTempData(null); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                onClick={handleOpenFile}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm disabled:opacity-70"
              >
                <FiCheck className="w-4 h-4" />
                Open List
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Files Grid */}
      {savedFiles.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedFiles.map((file) => (
            <div 
              key={file.id}
              onClick={() => setCurrentFile(file)}
              className="group p-6 bg-white border border-gray-100 rounded-2xl hover:border-indigo-600 hover:shadow-md transition-all cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {file.rows.length} rows
                  </span>
                  <button 
                    onClick={(e) => deleteSavedFile(file.id, e)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h4 className="font-bold text-gray-900 mb-1">{file.name}</h4>
              <p className="text-sm text-gray-500 mb-4">
                Added on {file.createdAt.toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="truncate max-w-[200px]">
                  Headers: {file.headers.slice(0, 3).join(", ")}
                  {file.headers.length > 3 ? "..." : ""}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
