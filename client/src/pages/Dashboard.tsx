import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Users, Calendar, FileText, DollarSign, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getPatientsByDoctor } from "@/lib/firestore";
import { useLocation } from "wouter";

export default function Dashboard() {
  const { doctor } = useAuth();
  const [, navigate] = useLocation();

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", doctor?.id],
    queryFn: () => doctor ? getPatientsByDoctor(doctor.id) : Promise.resolve([]),
    enabled: !!doctor,
  });

  const stats = {
    totalPatients: patients.length,
    todayAppointments: 8, // This would come from appointments data
    pendingPrescriptions: 3, // This would come from prescriptions data
    monthlyRevenue: 12450, // This would come from invoices data
  };

  const recentPatients = patients.slice(0, 3);

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-medical-gray-800">Dashboard Overview</h2>
        <p className="text-medical-gray-600 mt-1">
          Welcome back, Dr. {doctor?.firstName} {doctor?.lastName}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-white shadow-sm border border-medical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-medical-gray-600 text-sm font-medium">Total Patients</p>
                <p className="text-2xl font-bold text-medical-gray-800 mt-1">
                  {stats.totalPatients}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-blue/10 rounded-lg flex items-center justify-center">
                <Users className="text-medical-blue text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-medical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-medical-gray-600 text-sm font-medium">Today's Appointments</p>
                <p className="text-2xl font-bold text-medical-gray-800 mt-1">
                  {stats.todayAppointments}
                </p>
              </div>
              <div className="w-12 h-12 bg-medical-green/10 rounded-lg flex items-center justify-center">
                <Calendar className="text-medical-green text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-medical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-medical-gray-600 text-sm font-medium">Pending Prescriptions</p>
                <p className="text-2xl font-bold text-medical-gray-800 mt-1">
                  {stats.pendingPrescriptions}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <FileText className="text-orange-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-medical-gray-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-medical-gray-600 text-sm font-medium">Monthly Revenue</p>
                <p className="text-2xl font-bold text-medical-gray-800 mt-1">
                  ${stats.monthlyRevenue.toLocaleString()}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600 text-xl" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-sm border border-medical-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-medical-gray-800 mb-4">Recent Patients</h3>
            {recentPatients.length === 0 ? (
              <div className="text-center py-8">
                <Users className="mx-auto h-12 w-12 text-medical-gray-400" />
                <p className="text-medical-gray-600 mt-2">No patients added yet</p>
                <Button
                  onClick={() => navigate("/patients")}
                  className="mt-4 bg-medical-blue hover:bg-blue-700"
                >
                  Add Your First Patient
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPatients.map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 bg-medical-gray-50 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-medical-blue rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getInitials(patient.firstName, patient.lastName)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-medical-gray-800">
                          {patient.firstName} {patient.lastName}
                        </p>
                        <p className="text-sm text-medical-gray-600">
                          Last visit: {patient.updatedAt.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`/patients/${patient.id}`)}
                      className="text-medical-blue hover:text-blue-700"
                    >
                      View
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm border border-medical-gray-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-medical-gray-800 mb-4">Today's Schedule</h3>
            <div className="space-y-4">
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-medical-gray-400" />
                <p className="text-medical-gray-600 mt-2">No appointments scheduled</p>
                <p className="text-sm text-medical-gray-500 mt-1">
                  Appointment scheduling coming soon
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
