
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Mock users data
  const users = [
    { id: 1, name: "John Doe", email: "johndoe@example.com", role: "Developer", status: "Active", lastActive: "Today" },
    { id: 2, name: "Jane Smith", email: "janesmith@example.com", role: "Designer", status: "Active", lastActive: "Yesterday" },
    { id: 3, name: "Michael Brown", email: "michaelbrown@example.com", role: "Developer", status: "Inactive", lastActive: "3 days ago" },
    { id: 4, name: "Emily Johnson", email: "emilyjohnson@example.com", role: "Manager", status: "Active", lastActive: "Today" },
    { id: 5, name: "David Wilson", email: "davidwilson@example.com", role: "Analyst", status: "Active", lastActive: "1 week ago" },
  ];

  // Filtered users based on search term
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar role="admin" />
      
      <PageTransition>
        <main className="pt-24 pl-72 pr-8 pb-16 animate-fade-in">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-semibold mb-6">Manage Users</h1>
            
            <div className="flex justify-between mb-6">
              <div className="w-full max-w-md">
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button>Add New User</Button>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.role}</td>
                        <td>
                          <span className={`status-badge ${user.status === "Active" ? "approved" : "rejected"}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.lastActive}</td>
                        <td>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Disable</Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted-foreground">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Users;
