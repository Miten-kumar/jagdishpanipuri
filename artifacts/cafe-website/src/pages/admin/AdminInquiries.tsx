import { Trash2, Mail, Phone, Calendar } from "lucide-react";
import { useGetInquiries, useDeleteInquiry, getGetInquiriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export default function AdminInquiries() {
  const { data: inquiries, isLoading } = useGetInquiries();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const deleteInquiry = useDeleteInquiry();

  const handleDelete = (id: number) => {
    if (!confirm("Delete this inquiry?")) return;
    deleteInquiry.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetInquiriesQueryKey() });
        toast({ title: "Inquiry deleted" });
      },
    });
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Inquiries</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Messages received from your contact form.
          {inquiries && <span className="ml-1">({inquiries.length} total)</span>}
        </p>
      </div>

      {isLoading ? (
        <div className="text-muted-foreground text-center py-10">Loading...</div>
      ) : inquiries && inquiries.length > 0 ? (
        <div className="space-y-4">
          {inquiries.map((inq) => (
            <Card key={inq.id} data-testid={`inquiry-card-${inq.id}`}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="font-semibold text-foreground">{inq.name}</span>
                      {!inq.isRead && <Badge variant="secondary" className="text-xs">New</Badge>}
                      <span className="text-muted-foreground text-xs">—</span>
                      <span className="font-medium text-foreground text-sm">{inq.subject}</span>
                    </div>
                    <p className="text-foreground/80 text-sm leading-relaxed mb-3">{inq.message}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" />
                        <a href={`mailto:${inq.email}`} className="hover:text-primary transition-colors">{inq.email}</a>
                      </div>
                      {inq.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{inq.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(inq.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild>
                      <a href={`mailto:${inq.email}?subject=Re: ${inq.subject}`} data-testid={`button-reply-${inq.id}`}>
                        Reply
                      </a>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(inq.id)}
                      data-testid={`button-delete-inquiry-${inq.id}`}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No inquiries yet. They'll appear here when customers contact you.</p>
        </div>
      )}
    </div>
  );
}
