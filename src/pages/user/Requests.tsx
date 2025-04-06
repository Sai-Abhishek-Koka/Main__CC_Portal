
import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { PageTransition } from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { StatusBadge, StatusType } from "@/components/StatusBadge";
import { toast } from "sonner";
import { Spinner } from "@/components/Spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Define the base URL for API calls
const API_BASE_URL = "http://localhost:5000";

interface Request {
  requestID: string;
  type: string;
  description: string;
  status: StatusType;
  timestamp: string;
  userName: string;
  serverName: string | null;
  userID: string;
  serverID: string | null;
}

const Requests = () => {
  const [requestTitle, setRequestTitle] = useState("");
  const [requestDescription, setRequestDescription] = useState("");
  const [requestPriority, setRequestPriority] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userRequests, setUserRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's requests on component mount
  useEffect(() => {
    fetchUserRequests();
  }, []);

  const fetchUserRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      console.log("Fetching user requests from:", `${API_BASE_URL}/api/requests`);
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch requests: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("User requests data received:", data);
      setUserRequests(data);
      setError(null);
    } catch (err: any) {
      console.error("Error fetching user requests:", err);
      setError(err.message || "Failed to fetch requests");
      toast.error("Failed to load your requests");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!requestTitle || !requestDescription || !requestPriority) {
      toast.error("Please fill in all fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem("token");
      
      if (!token) {
        throw new Error("No authentication token found");
      }
      
      // Generate a unique request ID (in a real app this would be done by the server)
      const requestID = `req${Date.now()}`;
      
      // Prepare the request data
      const requestData = {
        requestID,
        type: requestTitle,
        description: requestDescription,
        priority: requestPriority,
        // The server will add the userID, timestamp, and status automatically
      };
      
      // Send the request to the server
      const response = await fetch(`${API_BASE_URL}/api/requests`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to submit request: ${response.statusText}`);
      }
      
      toast.success("Request submitted successfully");
      
      // Reset form
      setRequestTitle("");
      setRequestDescription("");
      setRequestPriority("");
      
      // Refresh user's requests
      fetchUserRequests();
    } catch (err: any) {
      console.error("Error submitting request:", err);
      toast.error(err.message || "Failed to submit request");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(date);
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
              
              {error && (
                <Alert variant="destructive" className="mb-6">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner />
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="px-4 py-2 text-left">Title</th>
                        <th className="px-4 py-2 text-left">Description</th>
                        <th className="px-4 py-2 text-left">Priority</th>
                        <th className="px-4 py-2 text-left">Date</th>
                        <th className="px-4 py-2 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userRequests.length > 0 ? (
                        userRequests.map((request) => (
                          <tr key={request.requestID} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-3 border-t">{request.type}</td>
                            <td className="px-4 py-3 border-t">{request.description}</td>
                            <td className="px-4 py-3 border-t">
                              <StatusBadge 
                                status={request.type.toLowerCase() as "high" | "medium" | "low"}
                              >
                                {request.type}
                              </StatusBadge>
                            </td>
                            <td className="px-4 py-3 border-t">{formatDate(request.timestamp)}</td>
                            <td className="px-4 py-3 border-t">
                              <StatusBadge status={request.status} />
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted-foreground">
                            No previous requests
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </div>
        </main>
      </PageTransition>
    </div>
  );
};

export default Requests;
