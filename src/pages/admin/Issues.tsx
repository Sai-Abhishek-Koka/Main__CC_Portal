
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const Issues = () => {
  // Mock issues data
  const pendingIssues = [
    { 
      id: 1, 
      user: "John Doe", 
      title: "Wi-Fi not working", 
      description: "Cannot connect to Campus Wi-Fi", 
      priority: "High"
    },
    { 
      id: 2, 
      user: "Jane Smith", 
      title: "VPN Issue", 
      description: "Unable to connect to VPN from home", 
      priority: "Medium"
    },
    { 
      id: 3, 
      user: "Alex Johnson", 
      title: "Email Problems", 
      description: "Cannot send or receive emails since this morning", 
      priority: "High"
    },
  ];

  const handleResolve = (id: number) => {
    toast.success(`Issue #${id} has been marked as resolved`);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar role="admin" />
      
      <PageTransition>
        <main className="pt-24 pl-72 pr-8 pb-16 animate-fade-in">
          <div className="max-w-6xl">
            <h1 className="text-3xl font-semibold mb-6">Manage Issues</h1>
            
            <p className="text-muted-foreground mb-6">
              View Issues reported by the users
            </p>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">Pending Issues</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>User</th>
                      <th>Issue Title</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingIssues.length > 0 ? (
                      pendingIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
                          <td>{issue.user}</td>
                          <td>{issue.title}</td>
                          <td>{issue.description}</td>
                          <td>
                            <StatusBadge 
                              status={issue.priority.toLowerCase() as "high" | "medium" | "low"}
                            >
                              {issue.priority}
                            </StatusBadge>
                          </td>
                          <td>
                            <Button 
                              onClick={() => handleResolve(issue.id)}
                              className="bg-green-500 hover:bg-green-600 text-white"
                              size="sm"
                            >
                              Mark as Resolved
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted-foreground">
                          No pending issues
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

export default Issues;
