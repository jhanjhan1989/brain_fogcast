import React, { useState, useEffect } from "react";
import Button from "../../components/UI/forms/Button";
import InputText from "../../components/UI/forms/InputText";
import SelectInput from "../../components/UI/forms/SelectInput";

interface UserModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (data: any) => void;
    defaultValues?: any;
    submitting?: boolean;
}

export default function UserModal({
    visible,
    onClose,
    onSubmit,
    defaultValues = { fullName: "", email: "", role: "DEVELOPER", password: "" },
    submitting,
}: UserModalProps) {
    const [form, setForm] = useState(defaultValues);
    const [error, setError] = useState("");

    useEffect(() => {
        if (visible) {
            setForm(defaultValues);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]); // only depend on 'visible', not defaultValues


    if (!visible) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black/50 flex justify-center items-center">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg w-full max-w-md p-6 relative">
                <h2 className="text-xl font-bold mb-4">
                    {defaultValues.id ? "Edit User" : "New User"}
                </h2>

                <div className="space-y-3">
                    <InputText
                        label="Full Name"
                        name="fullName"
                        value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                    />

                    <InputText
                        label="Email Address"
                        name="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="your@email.com"
                        error={error}
                    />

                    {!defaultValues.id && (
                        <InputText
                            label="Password"
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                        />
                    )}


                    <SelectInput
                        label="Role"
                        value={form.role}
                        onChange={(e) => setForm({ ...form, role: e.target.value })}
                        options={["ADMIN", "PROJECT_MANAGER", "DEVELOPER", "QA", "CLIENT"]}
                    />

                </div>

                <div className="flex justify-end mt-5 gap-2">
                    <Button variant="cancel" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button variant="save" onClick={() => onSubmit(form)} loading={submitting}>
                        {defaultValues.id ? "Update" : "Create"}
                    </Button>
                </div>
            </div>
        </div>
    );
}
