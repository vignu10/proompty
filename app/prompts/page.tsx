"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

interface Prompt {
  id: string;
  title: string;
  content: string;
  category: string | null;
  tags: string[];
  createdAt: string;
}

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { token } = useAuth();

  useEffect(() => {
    fetchPrompts();
  }, [token]);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch prompts");
      }

      const data = await response.json();
      setPrompts(data);
    } catch (err) {
      console.log(err);
      setError("Failed to load prompts");
    } finally {
      setLoading(false);
    }
  };

  const deletePrompt = async (id: string) => {
    try {
      const response = await fetch(`/api/prompts/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete prompt");
      }

      setPrompts(prompts.filter((prompt) => prompt.id !== id));
    } catch (err) {
      console.log(err);
      setError("Failed to delete prompt");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Prompts</h1>
        <Link
          href="/prompts/new"
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          Create New Prompt
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {prompts.map((prompt) => (
          <div key={prompt.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{prompt.title}</h2>
            <p className="text-gray-600 mb-4">{prompt.content}</p>
            {prompt.category && (
              <p className="text-sm text-gray-500 mb-2">
                Category: {prompt.category}
              </p>
            )}
            {prompt.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {prompt.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <div className="flex justify-end space-x-2">
              <Link
                href={`/prompts/${prompt.id}/edit`}
                className="text-indigo-600 hover:text-indigo-800"
              >
                Edit
              </Link>
              <button
                onClick={() => deletePrompt(prompt.id)}
                className="text-red-600 hover:text-red-800"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
