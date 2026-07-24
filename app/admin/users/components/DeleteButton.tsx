"use client";

import { Trash2 } from "lucide-react";
import { deleteUserAction } from "@/server/admin/auth-actions";

export default function DeleteButton({ id, username }: { id: number, username: string }) {
  if (username === 'admin') return null;

  return (
    <button 
      onClick={async () => {
        if (confirm("Are you sure you want to delete this user?")) {
          await deleteUserAction(id);
        }
      }}
      className="p-2.5 bg-red-500/5 border border-red-500/10 hover:bg-red-500 hover:text-white rounded-xl transition-all text-red-500"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}