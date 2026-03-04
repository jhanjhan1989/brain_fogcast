import React, { useEffect, useState } from "react";
// import { userService } from "../services/userService";
// import Button from "../components/UI/forms/Button";
// import UserModal from "../components/UserModal";
// import UserTable from "../components/UserTable";
import toast, { Toaster } from "react-hot-toast";
import { userService } from "../../services/userService";
import Button from "../../components/UI/forms/Button";
import UserModal from "./UserModal";
import Table from "../../components/Tables/Table";

export default function UserList() {
    const [users, setUsers] = useState<any[]>([]);
    const [filtered, setFiltered] = useState<any[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [modalVisible, setModalVisible] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [submitting, setSubmitting] = useState(false);

    const fetchUsers = async () => {
        try {
            const res = await userService.getAll();
            setUsers(res.data);
            setFiltered(res.data);
        } catch (err) {
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(
            users.filter(
                (u) =>
                    u.fullName.toLowerCase().includes(lower) ||
                    u.email.toLowerCase().includes(lower)
            )
        );
    }, [search, users]);

    const handleSubmit = async (data: any) => {
        try {
            setSubmitting(true);
            if (editing) await userService.update(editing.id, data);
            else await userService.create(data);
            await fetchUsers();
            setModalVisible(false);
            toast.success(`User ${editing ? "updated" : "created"} successfully`);
        } catch (err) {
            toast.error("Failed to save user");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            await userService.delete(id);
            setUsers(users.filter((u) => u.id !== id));
            toast.success("User deleted");
        } catch {
            toast.error("Failed to delete user");
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <Toaster position="top-right" />
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Users</h1>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="border rounded-md px-3 py-2"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <Button variant="add" onClick={() => { setEditing(null);  setModalVisible(true); }}>
                        + New User
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="animate-pulse text-gray-400">Loading users...</div>
            ) : filtered.length === 0 ? (
                <p className="text-gray-500 text-center">No users found.</p>
            ) : (
                <Table
                    items={filtered}
                    onEdit={(u) => { setEditing(u); setModalVisible(true); }} onDelete={handleDelete}
                    columns={["fullName", "email", "role", "status", "createdAt"]}
                />


            )}

            <UserModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleSubmit}
                defaultValues={editing || { fullName: "", email: "", role: "DEVELOPER", password: "" }}
                submitting={submitting}
            />
        </div>
    );
}
