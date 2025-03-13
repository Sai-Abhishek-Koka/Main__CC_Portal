
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

const Issues = () => {
  const [issueTitle, setIssueTitle] = useState("");
  const [issueDescription, setIssueDescription] = useState("");
  const [issuePriority, setIssuePriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Mock reported issues data
  const reportedIssues = [
    { 
      id: 1, 
      title: "Wi-Fi Not Working", 
      description: "Unable to connect to campus Wi-Fi", 
      priority: "High", 
      status: "open"
    },
    { 
      id: 2, 
      title: "Server Downtime", 
      description: "The research server is down affecting project work", 
      priority: "Medium", 
      status: "solved"
    },
    { 
      id: 3, 
      title: "Printer Issue", 
      description: "Cannot connect to the department printer", 
      priority: "Low", 
      status: "open"
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!issueTitle || !issueDescription || !issuePriority) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    // Simulate API request
    setTimeout(() => {
      toast.success("Issue reported successfully");
      
      // Reset form
      setIssueTitle("");
      setIssueDescription("");
      setIssuePriority("");
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
              <h1 className="text-3xl font-semibold mb-6">Report an Issue</h1>
              
              <div className="bg-white rounded-lg shadow-sm border border-border p-6">
                <p className="text-sm text-muted-foreground mb-6">
                  Submit a new Issue
                </p>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="issue-title">Issue Title</Label>
                    <Input
                      id="issue-title"
                      placeholder="Enter Issue Title"
                      value={issueTitle}
                      onChange={(e) => setIssueTitle(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="issue-description">Issue Description</Label>
                    <Textarea
                      id="issue-description"
                      placeholder="Enter Issue Description (Details)"
                      value={issueDescription}
                      onChange={(e) => setIssueDescription(e.target.value)}
                      rows={4}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="issue-priority">Priority</Label>
                    <Select
                      value={issuePriority}
                      onValueChange={setIssuePriority}
                    >
                      <SelectTrigger id="issue-priority">
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
              <h2 className="text-2xl font-semibold mb-4">My Reported Issues</h2>
              
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
                    {reportedIssues.length > 0 ? (
                      reportedIssues.map((issue) => (
                        <tr key={issue.id} className="hover:bg-muted/30 transition-colors">
                          <td>{issue.title}</td>
                          <td>{issue.description}</td>
                          <td>{issue.priority}</td>
                          <td>
                            <StatusBadge status={issue.status} />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted-foreground">
                          No reported issues
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
