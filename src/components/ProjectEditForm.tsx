import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { X, Save } from "lucide-react";

const formSchema = z.object({
  system_title: z.string().min(1, "Título é obrigatório"),
  system_location: z.string().optional(),
  is_saas: z.boolean().default(false),
  urls: z.string(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  password: z.string().optional(),
  referral_link: z.string().url("URL inválida").optional().or(z.literal("")),
  was_referred: z.boolean().default(false),
  referral_email: z.string().email("Email inválido").optional().or(z.literal("")),
  has_supabase: z.boolean().default(false),
  supabase_email: z.string().email("Email inválido").optional().or(z.literal("")),
  supabase_password: z.string().optional(),
  supabase_projeto: z.string().optional(),
  has_github: z.boolean().default(false),
  github_username: z.string().optional(),
  github_password: z.string().optional(),
  github_page: z.string().optional(),
  github_url: z.string().optional(),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

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

interface ProjectEditFormProps {
  project: Project;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProjectEditForm = ({ project, onSuccess, onCancel }: ProjectEditFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      system_title: project.system_title,
      system_location: project.system_location || "",
      is_saas: project.is_saas,
      urls: project.urls.join("\n"),
      email: project.email || "",
      password: project.password || "",
      referral_link: project.referral_link || "",
      was_referred: project.was_referred,
      referral_email: project.referral_email || "",
      has_supabase: project.has_supabase,
      supabase_email: project.supabase_email || "",
      supabase_password: project.supabase_password || "",
      supabase_projeto: project.supabase_projeto || "",
      has_github: project.has_github,
      github_username: project.github_username || "",
      github_password: project.github_password || "",
      github_page: project.github_page || "",
      github_url: project.github_url || "",
      notes: project.notes || "",
    },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const urls = data.urls
        .split("\n")
        .map(url => url.trim())
        .filter(url => url.length > 0);

      const { error } = await supabase
        .from("projects")
        .update({
          system_title: data.system_title,
          system_location: data.system_location || null,
          is_saas: data.is_saas,
          urls: urls,
          email: data.email || null,
          password: data.password || null,
          referral_link: data.referral_link || null,
          was_referred: data.was_referred,
          referral_email: data.referral_email || null,
          has_supabase: data.has_supabase,
          supabase_email: data.supabase_email || null,
          supabase_password: data.supabase_password || null,
          supabase_projeto: data.supabase_projeto || null,
          has_github: data.has_github,
          github_username: data.github_username || null,
          github_password: data.github_password || null,
          github_page: data.github_page || null,
          github_url: data.github_url || null,
          notes: data.notes || null,
        })
        .eq("id", project.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Projeto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar projeto",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="modern-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Editar Projeto</CardTitle>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="system_title">Título do Sistema *</Label>
                <Input
                  id="system_title"
                  {...form.register("system_title")}
                  placeholder="Nome do sistema/projeto"
                />
                {form.formState.errors.system_title && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.system_title.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="system_location">Local do Sistema</Label>
                <Input
                  id="system_location"
                  {...form.register("system_location")}
                  placeholder="Onde está hospedado"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_saas"
                checked={form.watch("is_saas")}
                onCheckedChange={(checked) => form.setValue("is_saas", !!checked)}
              />
              <Label htmlFor="is_saas">É um SaaS?</Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="urls">URLs (uma por linha)</Label>
              <Textarea
                id="urls"
                {...form.register("urls")}
                placeholder="https://example.com&#10;https://admin.example.com"
                rows={3}
              />
            </div>
          </div>

          {/* Credenciais Principais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Credenciais Principais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  placeholder="usuario@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {/* Supabase */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_supabase"
                checked={form.watch("has_supabase")}
                onCheckedChange={(checked) => form.setValue("has_supabase", !!checked)}
              />
              <Label htmlFor="has_supabase" className="text-lg font-semibold text-primary">
                Possui Supabase?
              </Label>
            </div>

            {form.watch("has_supabase") && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="supabase_email">Email Supabase</Label>
                  <Input
                    id="supabase_email"
                    type="email"
                    {...form.register("supabase_email")}
                    placeholder="supabase@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase_password">Senha Supabase</Label>
                  <Input
                    id="supabase_password"
                    type="password"
                    {...form.register("supabase_password")}
                    placeholder="••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supabase_projeto">Nome do Projeto</Label>
                  <Input
                    id="supabase_projeto"
                    {...form.register("supabase_projeto")}
                    placeholder="nome-do-projeto"
                  />
                </div>
              </div>
            )}
          </div>

          {/* GitHub */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has_github"
                checked={form.watch("has_github")}
                onCheckedChange={(checked) => form.setValue("has_github", !!checked)}
              />
              <Label htmlFor="has_github" className="text-lg font-semibold text-primary">
                Possui GitHub?
              </Label>
            </div>

            {form.watch("has_github") && (
              <div className="space-y-4 pl-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github_username">Username GitHub</Label>
                    <Input
                      id="github_username"
                      {...form.register("github_username")}
                      placeholder="username"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github_password">Senha GitHub</Label>
                    <Input
                      id="github_password"
                      type="password"
                      {...form.register("github_password")}
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="github_page">Página</Label>
                    <Input
                      id="github_page"
                      {...form.register("github_page")}
                      placeholder="Ex: minha-empresa"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="github_url">URL Git</Label>
                    <Input
                      id="github_url"
                      {...form.register("github_url")}
                      placeholder="https://github.com/usuario/repositorio"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Indicação */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="was_referred"
                checked={form.watch("was_referred")}
                onCheckedChange={(checked) => form.setValue("was_referred", !!checked)}
              />
              <Label htmlFor="was_referred" className="text-lg font-semibold text-primary">
                Foi indicado por alguém?
              </Label>
            </div>

            {form.watch("was_referred") && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="referral_email">Email do indicador</Label>
                  <Input
                    id="referral_email"
                    type="email"
                    {...form.register("referral_email")}
                    placeholder="indicador@exemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="referral_link">Link de indicação</Label>
                  <Input
                    id="referral_link"
                    {...form.register("referral_link")}
                    placeholder="https://link-de-indicacao.com"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Observações */}
          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              {...form.register("notes")}
              placeholder="Anotações importantes sobre o projeto..."
              rows={3}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="btn-modern">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};