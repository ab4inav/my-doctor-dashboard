import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Filter, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { AddPatientModal } from "@/components/modals/AddPatientModal";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientsByDoctor } from "@/lib/firestore";
import { useLocation } from "wouter";
import type { Patient } from "@shared/schema";

export default function Patients() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const { doctor } = useAuth();
  const [, navigate] = useLocation();

  const { data: patients = [], refetch } = useQuery({
    queryKey: ["patients", doctor?.id],
    queryFn: () => doctor ? getPatientsByDoctor(doctor.id) : Promise.resolve([]),
    enabled: !!doctor,
  });

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phoneNumber.includes(searchTerm);

    // For now, all patients are considered "active"
    // In a real app, you might have status fields
    const matchesFilter = filterStatus === "all" || filterStatus === "active";

    return matchesSearch && matchesFilter;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-medical-blue",
      "bg-medical-green", 
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500"
    ];
    return colors[index % colors.length];
  };

  const handlePatientAdded = () => {
    refetch();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-medical-gray-800">Patient Management</h2>
          <p className="text-medical-gray-600 mt-1">Manage your patient records and information</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          className="bg-medical-blue text-white hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Patient</span>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search patients by name or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="recent">Recent Visits</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Grid */}
      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center">
              <Users className="mx-auto h-16 w-16 text-medical-gray-400" />
              <h3 className="text-lg font-medium text-medical-gray-800 mt-4">
                {searchTerm ? "No patients found" : "No patients added yet"}
              </h3>
              <p className="text-medical-gray-600 mt-2">
                {searchTerm 
                  ? "Try adjusting your search terms"
                  : "Add your first patient to get started with managing medical records"
                }
              </p>
              {!searchTerm && (
                <Button
                  onClick={() => setShowAddModal(true)}
                  className="mt-4 bg-medical-blue hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Patient
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPatients.map((patient, index) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 ${getAvatarColor(index)} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-medium">
                        {getInitials(patient.firstName, patient.lastName)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-medical-gray-800">
                        {patient.firstName} {patient.lastName}
                      </h3>
                      <p className="text-sm text-medical-gray-600">ID: {patient.id.slice(-6)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-medical-green/10 text-medical-green text-xs font-medium rounded-full">
                    Active
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-medical-gray-600">Age:</span>
                    <span className="text-medical-gray-800 font-medium">{patient.age} years</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-medical-gray-600">Gender:</span>
                    <span className="text-medical-gray-800 font-medium capitalize">{patient.gender}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-medical-gray-600">Last Visit:</span>
                    <span className="text-medical-gray-800 font-medium">
                      {patient.updatedAt.toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-medical-gray-600">Contact:</span>
                    <span className="text-medical-gray-800 font-medium">{patient.phoneNumber}</span>
                  </div>
                </div>

                <Button
                  onClick={() => navigate(`/patients/${patient.id}`)}
                  className="w-full bg-medical-blue text-white hover:bg-blue-700"
                >
                  View Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddPatientModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onPatientAdded={handlePatientAdded}
      />
    </div>
  );
}
