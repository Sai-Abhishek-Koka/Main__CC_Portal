
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const Servers = () => {
  // Mock servers data
  const activeServers = [
    { 
      id: 1, 
      name: "Database Server", 
      ipAddress: "192.168.1.10", 
      uptime: "24hrs", 
      status: "online"
    },
    { 
      id: 2, 
      name: "Application Server", 
      ipAddress: "192.168.1.20", 
      uptime: "12hrs", 
      status: "maintenance"
    },
    { 
      id: 3, 
      name: "Storage Server", 
      ipAddress: "192.168.1.30", 
      uptime: "7d 12hrs", 
      status: "online"
    },
  ];

  const handleSetMaintenance = (id: number) => {
    toast.success(`Server #${id} has been set to maintenance mode`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar role="admin" />
      
      <PageTransition>
        <main className="pt-24 pl-72 pr-8 pb-16 animate-fade-in">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-semibold mb-6">Manage Servers</h1>
            
            <p className="text-muted-foreground mb-6">
              View and Update server details
            </p>
            
            <section>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Active Servers</h2>
                <Button>Add New Server</Button>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>Server Name</th>
                      <th>Server IP Address</th>
                      <th>Server Uptime</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeServers.length > 0 ? (
                      activeServers.map((server) => (
                        <tr key={server.id} className="hover:bg-muted/30 transition-colors">
                          <td>{server.name}</td>
                          <td>{server.ipAddress}</td>
                          <td>{server.uptime}</td>
                          <td>
                            <StatusBadge status={server.status} />
                          </td>
                          <td>
                            <Button 
                              onClick={() => handleSetMaintenance(server.id)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white"
                              size="sm"
                              disabled={server.status === "maintenance"}
                            >
                              Set Maintenance
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted-foreground">
                          No active servers
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

export default Servers;
