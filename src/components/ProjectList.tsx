import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Eye, EyeOff, ExternalLink } from "lucide-react";

interface Project {
  id: string;
  is_saas: boolean;
  system_title: string;
  urls: string[];
  system_location?: string;
  email?: string;
  password?: string;
  referral_link?: string;
  was_referred: boolean;
  referral_email?: string;
  has_supabase: boolean;
  supabase_email?: string;
  supabase_password?: string;
  supabase_projeto?: string;
  has_github: boolean;
  github_username?: string;
  github_password?: string;
  notes?: string;
  created_at: string;
}

interface ProjectListProps {
  refreshTrigger: number;
  onRefresh: () => void;
}

export const ProjectList = ({ refreshTrigger, onRefresh }: ProjectListProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPasswords, setShowPasswords] = useState<{[key: string]: boolean}>({});
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setProjects(data || []);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar projetos",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [refreshTrigger]);

  const togglePasswordVisibility = (projectId: string, field: string) => {
    const key = `${projectId}-${field}`;
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const renderPasswordField = (projectId: string, field: string, value?: string) => {
    if (!value) return "-";
    
    const key = `${projectId}-${field}`;
    const isVisible = showPasswords[key];
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm">
          {isVisible ? value : "••••••••"}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => togglePasswordVisibility(projectId, field)}
        >
          {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </Button>
      </div>
    );
  };

  const deleteProject = async (projectId: string) => {
    if (!confirm("Tem certeza que deseja excluir este projeto?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (error) {
        throw error;
      }

      toast({
        title: "Projeto excluído",
        description: "Projeto removido com sucesso.",
      });
      
      onRefresh();
    } catch (error: any) {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando projetos...</div>;
  }

  if (projects.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Nenhum projeto cadastrado ainda. Clique em "Novo Projeto" para começar.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {project.system_title}
                  {project.is_saas && <Badge variant="secondary">SaaS</Badge>}
                </CardTitle>
                {project.system_location && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {project.system_location}
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedProject(project);
                    setDialogOpen(true);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => deleteProject(project.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* URLs */}
            {project.urls && project.urls.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">URLs:</h4>
                <div className="space-y-1">
                  {project.urls.map((url, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm"
                      >
                        {url}
                      </a>
                      <ExternalLink className="w-3 h-3" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Credenciais Principais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium mb-2">Credenciais Principais</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {project.email || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Senha:</span>{" "}
                    {renderPasswordField(project.id, "password", project.password)}
                  </div>
                </div>
              </div>

              {/* Informações de Indicação */}
              {project.was_referred && (
                <div>
                  <h4 className="font-medium mb-2">Indicação</h4>
                  <div className="text-sm">
                    <span className="font-medium">Email do indicador:</span>{" "}
                    {project.referral_email || "-"}
                  </div>
                </div>
              )}
            </div>

            {/* Link de Indicação */}
            {project.referral_link && (
              <div>
                <h4 className="font-medium mb-2">Link de Indicação:</h4>
                <a 
                  href={project.referral_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline text-sm"
                >
                  {project.referral_link}
                </a>
              </div>
            )}

            {/* Supabase */}
            {project.has_supabase && (
              <div>
                <h4 className="font-medium mb-2">Supabase</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Email:</span> {project.supabase_email || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Senha:</span>{" "}
                    {renderPasswordField(project.id, "supabase_password", project.supabase_password)}
                  </div>
                  <div>
                    <span className="font-medium">Projeto:</span> {project.supabase_projeto || "-"}
                  </div>
                </div>
              </div>
            )}

            {/* GitHub */}
            {project.has_github && (
              <div>
                <h4 className="font-medium mb-2">GitHub</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Username:</span> {project.github_username || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Senha:</span>{" "}
                    {renderPasswordField(project.id, "github_password", project.github_password)}
                  </div>
                </div>
              </div>
            )}

            {/* Observações */}
            {project.notes && (
              <div>
                <h4 className="font-medium mb-2">Observações:</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {project.notes}
                </p>
              </div>
            )}

            <div className="text-xs text-muted-foreground border-t pt-2">
              Criado em: {new Date(project.created_at).toLocaleDateString("pt-BR")}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Dialog de Detalhes */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Projeto</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <div className="space-y-6">
              {/* Informações Básicas */}
              <div className="bg-muted/50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-3">{selectedProject.system_title}</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Tipo:</span> {selectedProject.is_saas ? "SaaS" : "Sistema"}
                  </div>
                  <div>
                    <span className="font-medium">Local:</span> {selectedProject.system_location || "-"}
                  </div>
                </div>
              </div>

              {/* URLs */}
              {selectedProject.urls && selectedProject.urls.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">URLs:</h4>
                  <div className="space-y-1">
                    {selectedProject.urls.map((url, index) => (
                      <a 
                        key={index}
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline text-sm flex items-center gap-2"
                      >
                        {url} <ExternalLink className="w-3 h-3" />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Credenciais Principais */}
              <div>
                <h4 className="font-semibold mb-2">Credenciais Principais</h4>
                <div className="bg-muted/30 p-3 rounded space-y-2 text-sm">
                  <div><span className="font-medium">Email:</span> {selectedProject.email || "-"}</div>
                  <div>
                    <span className="font-medium">Senha:</span>{" "}
                    {renderPasswordField(selectedProject.id, "password", selectedProject.password)}
                  </div>
                </div>
              </div>

              {/* Supabase */}
              {selectedProject.has_supabase && (
                <div>
                  <h4 className="font-semibold mb-2">Supabase</h4>
                  <div className="bg-muted/30 p-3 rounded space-y-2 text-sm">
                    <div><span className="font-medium">Email:</span> {selectedProject.supabase_email || "-"}</div>
                    <div>
                      <span className="font-medium">Senha:</span>{" "}
                      {renderPasswordField(selectedProject.id, "supabase_password", selectedProject.supabase_password)}
                    </div>
                    <div><span className="font-medium">Projeto:</span> {selectedProject.supabase_projeto || "-"}</div>
                  </div>
                </div>
              )}

              {/* GitHub */}
              {selectedProject.has_github && (
                <div>
                  <h4 className="font-semibold mb-2">GitHub</h4>
                  <div className="bg-muted/30 p-3 rounded space-y-2 text-sm">
                    <div><span className="font-medium">Username:</span> {selectedProject.github_username || "-"}</div>
                    <div>
                      <span className="font-medium">Senha:</span>{" "}
                      {renderPasswordField(selectedProject.id, "github_password", selectedProject.github_password)}
                    </div>
                  </div>
                </div>
              )}

              {/* Indicação */}
              {selectedProject.was_referred && (
                <div>
                  <h4 className="font-semibold mb-2">Indicação</h4>
                  <div className="bg-muted/30 p-3 rounded text-sm">
                    <div><span className="font-medium">Email do indicador:</span> {selectedProject.referral_email || "-"}</div>
                  </div>
                </div>
              )}

              {/* Link de Indicação */}
              {selectedProject.referral_link && (
                <div>
                  <h4 className="font-semibold mb-2">Link de Indicação</h4>
                  <a 
                    href={selectedProject.referral_link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm"
                  >
                    {selectedProject.referral_link}
                  </a>
                </div>
              )}

              {/* Observações */}
              {selectedProject.notes && (
                <div>
                  <h4 className="font-semibold mb-2">Observações</h4>
                  <div className="bg-muted/30 p-3 rounded text-sm whitespace-pre-wrap">
                    {selectedProject.notes}
                  </div>
                </div>
              )}

              <div className="text-xs text-muted-foreground border-t pt-2">
                Criado em: {new Date(selectedProject.created_at).toLocaleDateString("pt-BR")}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};