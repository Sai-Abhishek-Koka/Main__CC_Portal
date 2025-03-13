
import { useState } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/StatusBadge";
import { toast } from "sonner";

const Requests = () => {
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestPriority, setRequestPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock previous requests data
  const previousRequests = [
    { 
      id: 1, 
      title: "Server Access", 
      description: "Need access to new server", 
      priority: "High", 
      status: "pending"
    },
    { 
      id: 2, 
      title: "Software Installation", 
      description: "Installation of MATLAB", 
      priority: "Medium", 
      status: "approved"
    },
    { 
      id: 3, 
      title: "Access to Database", 
      description: "Require access to Oracle DB", 
      priority: "Low", 
      status: "rejected"
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestTitle || !requestDescription || !requestPriority) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      toast.success("Request submitted successfully");
      
      // Reset form
      setRequestTitle("");
      setRequestDescription("");
      setRequestPriority("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar role="user" />
      
      <PageTransition>
        <main className="pt-24 pl-72 pr-8 pb-16 animate-fade-in">
          <div className="max-w-6xl">
            <section className="mb-12">
              <h1 className="text-3xl font-semibold mb-6">Raise a Request</h1>
              
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <p className="text-sm text-muted-foreground mb-6">
                  Submit a new Request
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="request-title">Request Title</Label>
                    <Input
                      id="request-title"
                      placeholder="Enter Request Title"
                      value={requestTitle}
                      onChange={(e) => setRequestTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="request-description">Request Description</Label>
                    <Textarea
                      id="request-description"
                      placeholder="Enter Request Description (Details)"
                      value={requestDescription}
                      onChange={(e) => setRequestDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="request-priority">Priority</Label>
                    <Select
                      value={requestPriority}
                      onValueChange={setRequestPriority}
                    >
                      <SelectTrigger id="request-priority">
                        <SelectValue placeholder="Select Priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="pt-2">
                    <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                  </div>
                </form>
              </div>
            </section>
            
            <section>
              <h2 className="text-2xl font-semibold mb-4">My Previous Requests</h2>
              
              <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th>Title</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previousRequests.length > 0 ? (
                      previousRequests.map((request) => (
                        <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                          <td>{request.title}</td>
                          <td>{request.description}</td>
                          <td>{request.priority}</td>
                          <td>
                            <StatusBadge status={request.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted-foreground">
                          No previous requests
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
