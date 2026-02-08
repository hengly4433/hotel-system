"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import { apiJson } from "@/lib/api/client";
import { getErrorMessage } from "@/lib/api/errors";
import { Box, Alert, CircularProgress } from "@mui/material";
import EmployeeForm, { EmployeeFormData } from "../EmployeeForm";

type Property = {
  id: string;
  name: string;
};

type Employee = {
  id: string;
  propertyId: string;
  personId: string;
  firstName: string;
  lastName: string;
  dob: string | null;
  phone: string | null;
  email: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  postalCode: string | null;
  country: string | null;
  jobTitle: string | null;
  department: string | null;
  hireDate: string | null;
  hourlyRate: number | null;
  skills: string | null;
  photoUrl: string | null;
  employmentStatus: string;
};

function skillsToInput(skills: string | null) {
  if (!skills) return "";
  try {
    const parsed = JSON.parse(skills);
    if (Array.isArray(parsed)) {
      return parsed.join(", ");
    }
    return skills;
  } catch {
    return skills;
  }
}

function inputToSkills(value: string) {
  if (!value) return null;
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return JSON.stringify(items);
}

function employeeToFormData(employee: Employee): EmployeeFormData {
  return {
    propertyId: employee.propertyId,
    firstName: employee.firstName,
    lastName: employee.lastName,
    dob: employee.dob || "",
    phone: employee.phone || "",
    email: employee.email || "",
    addressLine1: employee.addressLine1 || "",
    addressLine2: employee.addressLine2 || "",
    city: employee.city || "",
    state: employee.state || "",
    postalCode: employee.postalCode || "",
    country: employee.country || "",
    jobTitle: employee.jobTitle || "",
    department: employee.department || "",
    hireDate: employee.hireDate || "",
    hourlyRate: employee.hourlyRate !== null ? String(employee.hourlyRate) : "",
    skills: skillsToInput(employee.skills),
    photoUrl: employee.photoUrl || "",
    employmentStatus: employee.employmentStatus || "ACTIVE"
  };
}

export default function EditEmployeePage() {
  const router = useRouter();
  const params = useParams();
  const employeeId = params.id as string;

  const [properties, setProperties] = useState<Property[]>([]);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [employeeData, propertiesData] = await Promise.all([
        apiJson<Employee>(`employees/${employeeId}`),
        apiJson<Property[]>("properties")
      ]);
      setEmployee(employeeData);
      setProperties(propertiesData);
      setError(null);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (form: EmployeeFormData) => {
    setIsSubmitting(true);
    setError(null);

    const payload = {
      propertyId: form.propertyId,
      firstName: form.firstName,
      lastName: form.lastName,
      dob: form.dob || null,
      phone: form.phone || null,
      email: form.email || null,
      addressLine1: form.addressLine1 || null,
      addressLine2: form.addressLine2 || null,
      city: form.city || null,
      state: form.state || null,
      postalCode: form.postalCode || null,
      country: form.country || null,
      jobTitle: form.jobTitle || null,
      department: form.department || null,
      hireDate: form.hireDate || null,
      hourlyRate: form.hourlyRate ? Number(form.hourlyRate) : null,
      skills: inputToSkills(form.skills),
      photoUrl: form.photoUrl || null,
      employmentStatus: form.employmentStatus
    };

    try {
      await apiJson(`employees/${employeeId}`, {
        method: "PUT",
        body: JSON.stringify(payload)
      });
      router.push("/admin/employees");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/employees");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!employee) {
    return (
      <Box component="main">
        <PageHeader title="Edit Employee" subtitle="Update employee details" />
        <Alert severity="error">Employee not found</Alert>
      </Box>
    );
  }

  return (
    <Box component="main">
      <PageHeader
        title="Edit Employee"
        subtitle={`Update details for ${employee.firstName} ${employee.lastName}`}
      />

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <EmployeeForm
        initialData={employeeToFormData(employee)}
        properties={properties}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        isEditing={true}
      />
    </Box>
  );
}
