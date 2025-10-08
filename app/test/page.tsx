'use client';

import { useEffect, useState, ChangeEvent } from 'react';
import { createClient } from 'utils/supabase/client';
import { Session } from '@supabase/supabase-js';

interface Task {
  id: number;
  title: string;
  description: string;
  created_at: string;
  email?: string;
  image_url?: string;
}

interface NewTask {
  title: string;
  description: string;
}

export default function TaskManager() {
  const [newTask, setNewTask] = useState<NewTask>({ title: "", description: "" });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newDescription, setNewDescription] = useState<Task | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [taskImage, setTaskImage] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const supabase = createClient();

  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const { error, data } = await supabase
          .from("tasks")
          .select("*")
          .order("created_at", {ascending: true});

      if (error) {
        setError(`Error reading tasks: ${error.message}`);
        return;
      }
      
      setTasks(data || []);
    } catch (err) {
      setError("An unexpected error occurred while fetching tasks");
    } finally {
      setLoading(false);
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const filePath = `${file.name}-${Date.now()}`;

      const { error } = await supabase.storage
        .from("test-images")
        .upload(filePath, file);

      if (error) {
        console.error("Error uploading image:", error.message);
        // Check if it's an RLS policy error
        if (error.message.includes("row-level security policy")) {
          throw new Error("Storage access denied. Please check your storage permissions.");
        }
        throw new Error(`Upload failed: ${error.message}`);
      }

      const { data } = await supabase.storage
        .from("test-images")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error("Image upload error:", err);
      throw err;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newTask.title.trim() || !newTask.description.trim()) {
      setError("Please fill in both title and description");
      return;
    }

    if (!session?.user?.email) {
      setError("No user session found. Please log in.");
      return;
    }

    try {
      setLoading(true);
      
      let imageUrl: string | null = null;
      if (taskImage) {
        try {
          imageUrl = await uploadImage(taskImage);
        } catch (uploadError) {
          setError(uploadError instanceof Error ? uploadError.message : "Failed to upload image");
          return;
        }
      }

      const { error } = await (supabase as any)
        .from("tasks")
        .insert({...newTask, email: session.user.email, image_url: imageUrl });

      if (error) {
        setError(`Error adding task: ${error.message}`);
      } else {
        setNewTask({ title: "", description: "" });
        setTaskImage(null);
        resetFileInput();
        fetchTasks(); // Refresh the tasks list
      }
    } catch (err) {
      setError("An unexpected error occurred while adding the task");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id);

      if (error) {
        setError(`Error deleting task: ${error.message}`);
      } else {
        fetchTasks(); // Refresh the tasks list
      }
    } catch (err) {
      setError("An unexpected error occurred while deleting the task");
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (task: Task) => {
    setNewDescription({ ...task });
  };

  const handleEdit = async () => {
    if (!newDescription) return;

    try {
      setLoading(true);
      setError(null);
      
      const { error } = await (supabase as any)
        .from("tasks")
        .update({
          title: newDescription.title,
          description: newDescription.description
        })
        .eq("id", newDescription.id);

      if (error) {
        setError(`Error updating task: ${error.message}`);
      } else {
        setNewDescription(null);
        fetchTasks(); // Refresh the tasks list
      }
    } catch (err) {
      setError("An unexpected error occurred while updating the task");
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setNewDescription(null);
  };

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    
    getSession();
    fetchTasks();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setTaskImage(e.target.files[0]);
    }
  };

  const resetFileInput = () => {
    setTaskImage(null);
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-center mb-8">Task Manager CRUD</h1>
        
        {/* Error Display */}
        {error && (
          <div className="bg-red-600 text-white p-4 rounded mb-4">
            {error}
            <button 
              onClick={() => setError(null)}
              className="ml-2 text-red-200 hover:text-white"
            >
              ×
            </button>
          </div>
        )}
        
        {/* Loading Indicator */}
        {loading && (
          <div className="text-center text-gray-400 mb-4">
            Loading...
          </div>
        )}
        
        {/* Add Task Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <input
            type="text"
            placeholder="Task Name"
            value={newTask.title}
            onChange={(e) =>
              setNewTask((prev: NewTask) => ({ ...prev, title: e.target.value }))
            }
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
          />
          <input
            type="text"
            placeholder="Task Description"
            value={newTask.description}
            onChange={(e) =>
              setNewTask((prev: NewTask) => ({ ...prev, description: e.target.value }))
            }
            className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none focus:border-gray-500"
          />

          <div className="mb-4">
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange}
              className="w-full bg-gray-800 border border-gray-600 rounded px-4 py-3 text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-white hover:file:bg-gray-600"
            />
            {taskImage && (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm text-gray-400">Selected: {taskImage.name}</span>
                <button
                  type="button"
                  onClick={resetFileInput}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded transition-colors"
          >
            {loading ? "Adding..." : "Add Task"}
          </button>
        </form>

        {/* Tasks List */}
        <ul style={{ listStyle: "none", padding: 0 }}>
          {tasks.map((task) => (
            <li
              key={task.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "1rem",
                marginBottom: "0.5rem",
              }}
              className="bg-gray-800"
            >
              {newDescription && newDescription.id === task.id ? (
                <div>
                  <input
                    type="text"
                    value={newDescription.title}
                    onChange={(e) => setNewDescription({...newDescription, title: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-2 text-white focus:outline-none focus:border-gray-500"
                  />
                  <input
                    type="text"
                    value={newDescription.description}
                    onChange={(e) => setNewDescription({...newDescription, description: e.target.value})}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 mb-2 text-white focus:outline-none focus:border-gray-500"
                  />
                  <div>
                    <button 
                      onClick={handleEdit}
                      disabled={loading}
                      style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                      className="bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button 
                      onClick={cancelEdit}
                      style={{ padding: "0.5rem 1rem" }}
                      className="bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold mb-2">{task.title}</h3>
                  {task.image_url && (
                    <div className="mb-4">
                      <img
                        src={task.image_url}
                        alt={`Image for ${task.title}`}
                        className="w-full max-h-80 object-cover rounded border border-gray-700"
                      />
                    </div>
                  )}
                  <p className="text-gray-300 mb-4">{task.description}</p>
                  <div>
                    <button 
                      onClick={() => startEdit(task)}
                      style={{ padding: "0.5rem 1rem", marginRight: "0.5rem" }}
                      className="bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(task.id)}
                      disabled={loading}
                      style={{ padding: "0.5rem 1rem" }}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded transition-colors"
                    >
                      {loading ? "Deleting..." : "Delete"}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <div className="text-center text-gray-400 mt-8">
            No tasks yet. Add your first task above!
          </div>
        )}
      </div>
    </div>
  );
}