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
import { Plus, LogOut, Sparkles } from "lucide-react";

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

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
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
                {projects.length} projeto{projects.length !== 1 ? 's' : ''} cadastrado{projects.length !== 1 ? 's' : ''}
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
                  projects={projects}
                  onRefresh={fetchProjects}
                  onEdit={handleEditProject}
                />
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;