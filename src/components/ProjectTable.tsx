import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Edit, Trash2, Check, X } from "lucide-react";

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

interface ProjectTableProps {
  projects: Project[];
  onRefresh: () => void;
  onEdit: (project: Project) => void;
}

export const ProjectTable = ({ projects, onRefresh, onEdit }: ProjectTableProps) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const deleteProject = async (projectId: string) => {
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
      setConfirmDelete(null);
    } catch (error: any) {
      toast({
        title: "Erro ao excluir projeto",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (projects.length === 0) {
    return (
      <div className="modern-card p-8 text-center text-muted-foreground">
        <div className="space-y-2">
          <h3 className="text-lg font-medium text-foreground">Nenhum projeto cadastrado</h3>
          <p>Clique em "Novo Projeto" para começar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-modern">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="table-header">
              <th className="table-cell text-left">Título do Sistema</th>
              <th className="table-cell text-left">Local do Sistema</th>
              <th className="table-cell text-left">Email</th>
              <th className="table-cell text-center">Possui Supabase?</th>
              <th className="table-cell text-center">Possui GitHub?</th>
              <th className="table-cell text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((project) => (
              <tr key={project.id} className="table-row">
                <td className="table-cell">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{project.system_title}</span>
                    {project.is_saas && <Badge variant="secondary" className="text-xs">SaaS</Badge>}
                  </div>
                </td>
                <td className="table-cell text-muted-foreground">
                  {project.system_location || "-"}
                </td>
                <td className="table-cell text-muted-foreground">
                  {project.email || "-"}
                </td>
                <td className="table-cell text-center">
                  {project.has_supabase ? (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                      {project.supabase_projeto || "Sim"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      Não
                    </Badge>
                  )}
                </td>
                <td className="table-cell text-center">
                  {project.has_github ? (
                    <Badge variant="default" className="bg-blue-100 text-blue-800 border-blue-200">
                      {project.github_username || "Sim"}
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      Não
                    </Badge>
                  )}
                </td>
                <td className="table-cell">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(project)}
                      className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {confirmDelete === project.id ? (
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteProject(project.id)}
                          className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setConfirmDelete(null)}
                          className="h-8 w-8 p-0 hover:bg-muted"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setConfirmDelete(project.id)}
                        className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};