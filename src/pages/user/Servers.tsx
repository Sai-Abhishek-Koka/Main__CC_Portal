
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { StatusBadge, StatusType } from "@/components/StatusBadge";

const Servers = () => {
  // Mock accessible servers data
  const accessibleServers = [
    { 
      id: 1, 
      name: "Database Server", 
      ipAddress: "192.168.1.10", 
      status: "online" as StatusType
    },
    { 
      id: 2, 
      name: "Application Server", 
      ipAddress: "192.168.1.20", 
      status: "maintenance" as StatusType
    },
    { 
      id: 3, 
      name: "Storage Server", 
      ipAddress: "192.168.1.30", 
      status: "online" as StatusType
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar role="user" />
      
      <PageTransition>
        <main className="pt-24 pl-72 pr-8 pb-16 animate-fade-in">
          <div className="max-w-6xl">
            <section>
              <h1 className="text-3xl font-semibold mb-6">My Servers</h1>
              
              <p className="text-muted-foreground mb-6">
                View all the servers you have access to
              </p>
              
              <h2 className="text-2xl font-semibold mb-4">Accessible Servers</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>Server Name</th>
                      <th>Server IP Address</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accessibleServers.length > 0 ? (
                      accessibleServers.map((server) => (
                        <tr key={server.id} className="hover:bg-muted/30 transition-colors">
                          <td>{server.name}</td>
                          <td>{server.ipAddress}</td>
                          <td>
                            <StatusBadge status={server.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="text-center py-4 text-muted-foreground">
                          No accessible servers
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
