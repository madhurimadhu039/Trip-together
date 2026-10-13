import React, { useState } from 'react';
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  Minus,
  Users,
  CheckCircle2,
  Check,
} from 'lucide-react';
import type { ChecklistItem, FamilyMember } from '../types';

interface PackingChecklistSectionProps {
  items: ChecklistItem[];
  setItems: React.Dispatch<React.SetStateAction<ChecklistItem[]>>;
  members: FamilyMember[];
  activeMemberId: string;
}

const DEFAULT_CATEGORIES = [
  'All Categories',
  'Personal Hygiene',
  'Clothing',
  'Travel Documents',
  'Darshan Essentials',
  'Electronics',
  'Medicines & Essentials',
  'Children Items',
];

export const PackingChecklistSection: React.FC<PackingChecklistSectionProps> = ({
  items,
  setItems,
  members,
  activeMemberId,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories');
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Personal Hygiene');
  const [customCategoryInput, setCustomCategoryInput] = useState('');
  const [newAssignedTo, setNewAssignedTo] = useState('all');
  const [newRequiredQty, setNewRequiredQty] = useState(4);
  const [addItemSuccess, setAddItemSuccess] = useState<string | null>(null);
  const [itemSuccessToast, setItemSuccessToast] = useState<string | null>(null);

  const activeMember = members.find((m) => m.id === activeMemberId) || members[0];

  const totalRequiredUnits = items.reduce((s, i) => s + i.requiredQuantity, 0);
  const totalPackedUnits = items.reduce((s, i) => s + i.packedQuantity, 0);
  const overallProgressPercent =
    totalRequiredUnits > 0 ? Math.round((totalPackedUnits / totalRequiredUnits) * 100) : 0;

  const handleToggleItemPacked = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextPacked = !item.isPacked;
        return {
          ...item,
          isPacked: nextPacked,
          packedQuantity: nextPacked ? item.requiredQuantity : 0,
          packedByMemberName: nextPacked ? activeMember.name : undefined,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
  };

  const handleAdjustPackedQuantity = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const nextQty = Math.max(0, Math.min(item.requiredQuantity, item.packedQuantity + delta));
        const nextIsPacked = nextQty === item.requiredQuantity;
        return {
          ...item,
          packedQuantity: nextQty,
          isPacked: nextIsPacked,
          packedByMemberName: nextQty > 0 ? activeMember.name : undefined,
          updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
      })
    );
  };

  const handleDeleteItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();

    const finalCat =
      newCategory === 'Custom' && customCategoryInput.trim()
        ? customCategoryInput.trim()
        : newCategory;

    const finalName = newItemName.trim() || `Essential ${finalCat} Item`;

    const assignedMember = members.find((m) => m.id === newAssignedTo);
    const assignedName =
      newAssignedTo === 'all'
        ? `All ${members.length} Family Members`
        : assignedMember?.name || 'Family Member';

    const created: ChecklistItem = {
      id: `chk-${Date.now()}`,
      category: finalCat,
      itemName: finalName,
      assignedToMemberId: newAssignedTo,
      assignedToName: assignedName,
      requiredQuantity: Math.max(1, Number(newRequiredQty) || 1),
      packedQuantity: 0,
      isPacked: false,
      updatedAt: 'Just now',
    };

    setItems((prev) => [created, ...prev]);
    // Ensure the newly created item is visible in the active tab!
    setSelectedCategory('All Categories');
    setNewItemName('');
    setCustomCategoryInput('');
    setAddItemSuccess('✓ Added Item!');
    setItemSuccessToast(`✓ Added "${finalName}" to packing list (Assigned to ${assignedName})`);
    setTimeout(() => {
      setAddItemSuccess(null);
      setItemSuccessToast(null);
    }, 3500);
  };

  const dynamicCategories = Array.from(
    new Set([
      ...DEFAULT_CATEGORIES,
      ...items.map((i) => i.category),
    ])
  );

  const visibleItems = items.filter((item) =>
    selectedCategory === 'All Categories' ? true : item.category === selectedCategory
  );

  return (
    <div className="space-y-8">
      {/* Header & Overall Family Progress */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Shared Family Packing Checklist · Quantity & Member Attribution Tracking
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Interactive Packing Progress ({overallProgressPercent}% Complete)
            </h2>
          </div>

          <div className="text-right font-mono-num">
            <span className="text-xs font-sans text-slate-500 block">
              Total Packed Units Across All Categories
            </span>
            <span className="text-xl font-bold text-[#0D4A42]">
              {totalPackedUnits} / {totalRequiredUnits} Units Packed
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0D4A42] transition-all duration-200"
              style={{ width: `${overallProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Per-Member Packing Progress Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {members.map((m) => {
            const memberItems = items.filter(
              (i) => i.assignedToMemberId === m.id || i.assignedToMemberId === 'all'
            );
            const req = memberItems.reduce((s, i) => s + i.requiredQuantity, 0);
            const pck = memberItems.reduce((s, i) => s + i.packedQuantity, 0);
            const pct = req > 0 ? Math.round((pck / req) * 100) : 100;

            return (
              <div
                key={m.id}
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between"
              >
                <div>
                  <div className="text-xs font-bold text-slate-900">{m.name}</div>
                  <div className="text-[11px] text-slate-500">
                    {m.role} · {pck}/{req} units ready
                  </div>
                </div>
                <span className="text-sm font-bold font-mono-num text-[#0D4A42]">{pct}%</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Checklist Item Form */}
      <div className="space-y-3">
        {itemSuccessToast && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{itemSuccessToast}</span>
            </div>
            <button
              type="button"
              onClick={() => setItemSuccessToast(null)}
              className="text-emerald-900 hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
        <form
          onSubmit={handleAddItem}
          className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Item Name (e.g. Toothbrushes, Traditional Attire)
            </label>
            <input
              type="text"
              value={newItemName}
              onChange={(e) => setNewItemName(e.target.value)}
              placeholder="Enter item name (or leave empty for quick default)..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D4A42]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              {DEFAULT_CATEGORIES.filter((c) => c !== 'All Categories').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="Custom">+ Custom Category...</option>
            </select>
            {newCategory === 'Custom' && (
              <input
                type="text"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                placeholder="Custom category name"
                className="w-full mt-1.5 px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Assign To</label>
            <select
              value={newAssignedTo}
              onChange={(e) => setNewAssignedTo(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="all">All {members.length} Family Members</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.role})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Required Quantity
            </label>
            <input
              type="number"
              min={1}
              max={50}
              value={newRequiredQty}
              onChange={(e) => setNewRequiredQty(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-num"
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                addItemSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
              }`}
            >
              {addItemSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  {addItemSuccess}
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-1.5">
        {dynamicCategories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              selectedCategory === cat
                ? 'bg-[#0D4A42] text-white'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Checklist Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-200">
          {visibleItems.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors ${
                item.isPacked ? 'bg-emerald-50/30' : 'hover:bg-slate-50/70'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleItemPacked(item.id)}
                  className="mt-0.5 text-[#0D4A42] hover:opacity-80 shrink-0"
                >
                  {item.isPacked ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-400" />
                  )}
                </button>
                <div>
                  <div
                    className={`text-sm font-bold ${
                      item.isPacked ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {item.itemName}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    <span>{item.category}</span>
                    <span> · </span>
                    <span>Assigned to: {item.assignedToName}</span>
                    {item.packedByMemberName && (
                      <>
                        <span> · </span>
                        <span className="text-emerald-800 font-medium">
                          Marked packed by {item.packedByMemberName} ({item.updatedAt})
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Counter (e.g., 4/4 Toothbrushes Packed) */}
              <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustPackedQuantity(item.id, -1)}
                    disabled={item.packedQuantity <= 0}
                    className="p-1 text-slate-700 hover:bg-white rounded disabled:opacity-30"
                    title="Decrease packed count"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-bold font-mono-num text-slate-900">
                    {item.packedQuantity} / {item.requiredQuantity} Packed
                  </span>
                  <button
                    type="button"
                    onClick={() => handleAdjustPackedQuantity(item.id, 1)}
                    disabled={item.packedQuantity >= item.requiredQuantity}
                    className="p-1 text-slate-700 hover:bg-white rounded disabled:opacity-30"
                    title="Increase packed count"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                  title="Delete item"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
