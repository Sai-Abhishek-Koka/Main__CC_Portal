
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const Requests = () => {
  // Mock pending requests data
  const pendingRequests = [
    { 
      id: 1, 
      user: "John Doe", 
      title: "Server Access", 
      description: "Need access to the new database for project work", 
      priority: "High"
    },
    { 
      id: 2, 
      user: "Jane Smith", 
      title: "VPN Access", 
      description: "VPN access to connect from home", 
      priority: "Medium"
    },
    { 
      id: 3, 
      user: "David Wilson", 
      title: "Software Installation", 
      description: "Need MATLAB installed on workstation", 
      priority: "Low"
    },
  ];

  const handleApprove = (id: number) => {
    toast.success(`Request #${id} has been approved`);
  };

  const handleReject = (id: number) => {
    toast.error(`Request #${id} has been rejected`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar role="admin" />
      
      <PageTransition>
        <main className="pt-24 pl-72 pr-8 pb-16 animate-fade-in">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-semibold mb-6">Manage User Requests</h1>
            
            <p className="text-muted-foreground mb-6">
              Approve or Reject requests based on details provided by the user
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Pending Requests</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>User</th>
                      <th>Request Title</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingRequests.length > 0 ? (
                      pendingRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                          <td>{request.user}</td>
                          <td>{request.title}</td>
                          <td>{request.description}</td>
                          <td>
                            <StatusBadge 
                              status={
                                request.priority === "High" 
                                  ? "pending" 
                                  : request.priority === "Medium" 
                                    ? "maintenance" 
                                    : "approved"
                              } 
                            >
                              {request.priority}
                            </StatusBadge>
                          </td>
                          <td>
                            <div className="flex space-x-2">
                              <Button 
                                onClick={() => handleApprove(request.id)}
                                className="bg-green-500 hover:bg-green-600 text-white"
                                size="sm"
                              >
                                Approve
                              </Button>
                              <Button 
                                onClick={() => handleReject(request.id)}
                                className="bg-red-500 hover:bg-red-600 text-white"
                                size="sm"
                              >
                                Reject
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted-foreground">
                          No pending requests
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Requests;
