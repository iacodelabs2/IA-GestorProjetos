import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { ProjectForm } from "@/components/ProjectForm";
import { ProjectTable } from "@/components/ProjectTable";
import { ProjectEditForm } from "@/components/ProjectEditForm";
import { Plus, LogOut, Sparkles, Filter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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
  github_page?: string;
  github_url?: string;
  notes?: string;
  created_at: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationFilter, setLocationFilter] = useState<string>("");
  const [saasFilter, setSaasFilter] = useState<string>("");
  const [showDetails, setShowDetails] = useState<Project | null>(null);
  const navigate = useNavigate();
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
      setFilteredProjects(data || []);
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

  // Filter projects when filters change
  useEffect(() => {
    let filtered = [...projects];
    
    if (locationFilter && locationFilter !== "all") {
      filtered = filtered.filter(project => project.system_location === locationFilter);
    }
    
    if (saasFilter && saasFilter !== "all") {
      const isSaas = saasFilter === "true";
      filtered = filtered.filter(project => project.is_saas === isSaas);
    }
    
    setFilteredProjects(filtered);
  }, [projects, locationFilter, saasFilter]);

  // Get unique locations for filter
  const uniqueLocations = Array.from(
    new Set(projects.map(p => p.system_location).filter(Boolean))
  );

  useEffect(() => {
    // Check authentication and get user
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
      } else {
        setUser(user);
        fetchProjects();
      }
    };

    checkAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session) {
          navigate("/auth");
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Erro ao sair",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleProjectCreated = () => {
    setShowForm(false);
    fetchProjects();
    toast({
      title: "Projeto criado!",
      description: "Projeto salvo com sucesso.",
    });
  };

  const handleProjectUpdated = () => {
    setEditingProject(null);
    fetchProjects();
    toast({
      title: "Projeto atualizado!",
      description: "Alterações salvas com sucesso.",
    });
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowForm(false);
  };

  const handleViewDetails = (project: Project) => {
    setShowDetails(project);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="modern-card p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="header-modern">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-primary-foreground">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Gerenciador de Projetos
                </h1>
                <p className="text-sm text-muted-foreground">Organize seus projetos de forma moderna</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">Logado</p>
              </div>
              <Button variant="outline" onClick={handleSignOut} className="glass-effect">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Header de ações */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold">Meus Projetos</h2>
              <p className="text-muted-foreground mt-1">
                {filteredProjects.length} de {projects.length} projeto{projects.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex gap-3">
              {editingProject && (
                <Button variant="outline" onClick={() => setEditingProject(null)}>
                  Cancelar Edição
                </Button>
              )}
              <Button 
                onClick={() => {
                  setShowForm(true);
                  setEditingProject(null);
                }} 
                className="btn-modern"
              >
                <Plus className="w-4 h-4 mr-2" />
                Novo Projeto
              </Button>
            </div>
          </div>

          {/* Formulário de novo projeto */}
          {showForm && (
            <div className="animate-fade-in">
              <ProjectForm 
                onSuccess={handleProjectCreated}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* Filtros */}
          {!showForm && !editingProject && projects.length > 0 && (
            <Card className="modern-card">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Filtros:</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Local:</span>
                    <Select value={locationFilter} onValueChange={setLocationFilter}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Todos os locais" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os locais</SelectItem>
                        {uniqueLocations.map((location) => (
                          <SelectItem key={location} value={location}>
                            {location}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Tipo:</span>
                    <Select value={saasFilter} onValueChange={setSaasFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Todos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="true">SaaS</SelectItem>
                        <SelectItem value="false">Não SaaS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(locationFilter || saasFilter) && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setLocationFilter("");
                        setSaasFilter("");
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Formulário de edição */}
          {editingProject && (
            <div className="animate-fade-in">
              <ProjectEditForm
                project={editingProject}
                onSuccess={handleProjectUpdated}
                onCancel={() => setEditingProject(null)}
              />
            </div>
          )}

          {/* Tabela de projetos */}
          {!showForm && !editingProject && (
            <div className="animate-fade-in">
              {loading ? (
                <div className="modern-card p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p>Carregando projetos...</p>
                </div>
              ) : (
                <ProjectTable
                  projects={filteredProjects}
                  onRefresh={fetchProjects}
                  onEdit={handleEditProject}
                  onViewDetails={handleViewDetails}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Dialog de detalhes */}
      <Dialog open={!!showDetails} onOpenChange={() => setShowDetails(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Detalhes do Projeto: {showDetails?.system_title}
            </DialogTitle>
          </DialogHeader>
          
          {showDetails && (
            <div className="space-y-6 pt-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Título do Sistema</h4>
                  <p className="text-sm bg-muted p-2 rounded">{showDetails.system_title}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Local do Sistema</h4>
                  <p className="text-sm bg-muted p-2 rounded">{showDetails.system_location || "Não informado"}</p>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">É SaaS?</h4>
                  <p className="text-sm bg-muted p-2 rounded">{showDetails.is_saas ? "Sim" : "Não"}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Email</h4>
                  <p className="text-sm bg-muted p-2 rounded">{showDetails.email || "Não informado"}</p>
                </div>
              </div>

              {/* URLs */}
              {showDetails.urls && showDetails.urls.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">URLs</h4>
                  <div className="space-y-1">
                    {showDetails.urls.map((url, index) => (
                      <a 
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm bg-muted p-2 rounded block hover:bg-muted/80 text-primary hover:underline"
                      >
                        {url}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Supabase */}
              {showDetails.has_supabase && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Supabase</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Email:</span>
                      <p className="text-sm bg-muted p-2 rounded">{showDetails.supabase_email || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Projeto:</span>
                      <p className="text-sm bg-muted p-2 rounded">{showDetails.supabase_projeto || "Não informado"}</p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Senha:</span>
                      <p className="text-sm bg-muted p-2 rounded">••••••••</p>
                    </div>
                  </div>
                </div>
              )}

              {/* GitHub */}
              {showDetails.has_github && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">GitHub</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Username:</span>
                      <p className="text-sm bg-muted p-2 rounded">{showDetails.github_username || "Não informado"}</p>
                    </div>
                    {showDetails.github_page && (
                      <div>
                        <span className="text-xs font-medium text-muted-foreground">Página:</span>
                        <p className="text-sm bg-muted p-2 rounded">{showDetails.github_page}</p>
                      </div>
                    )}
                    {showDetails.github_url && (
                      <div className="md:col-span-2">
                        <span className="text-xs font-medium text-muted-foreground">URL Git:</span>
                        <a 
                          href={showDetails.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm bg-muted p-2 rounded block hover:bg-muted/80 text-primary hover:underline"
                        >
                          {showDetails.github_url}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notas */}
              {showDetails.notes && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-primary">Observações</h4>
                  <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{showDetails.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;