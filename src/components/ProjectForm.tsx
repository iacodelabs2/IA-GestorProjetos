import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Plus, Trash2, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProjectFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProjectForm = ({ onSuccess, onCancel }: ProjectFormProps) => {
  const [loading, setLoading] = useState(false);
  const [isSaas, setIsSaas] = useState(false);
  const [systemTitle, setSystemTitle] = useState("");
  const [urls, setUrls] = useState<string[]>([""]);
  const [systemLocation, setSystemLocation] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [referralLink, setReferralLink] = useState("");
  const [wasReferred, setWasReferred] = useState(false);
  const [referralEmail, setReferralEmail] = useState("");
  const [hasSupabase, setHasSupabase] = useState(false);
  const [supabaseEmail, setSupabaseEmail] = useState("");
  const [supabasePassword, setSupabasePassword] = useState("");
  const [hasGithub, setHasGithub] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubPassword, setGithubPassword] = useState("");
  const [githubPage, setGithubPage] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [supabaseProjeto, setSupabaseProjeto] = useState("");
  const [notes, setNotes] = useState("");
  const [generalProgress, setGeneralProgress] = useState<number>(0);
  const [steps, setSteps] = useState<Array<{step_name: string, step_description: string, progress_percentage: number}>>([]);
  const { toast } = useToast();

  const addUrl = () => {
    setUrls([...urls, ""]);
  };

  const removeUrl = (index: number) => {
    if (urls.length > 1) {
      setUrls(urls.filter((_, i) => i !== index));
    }
  };

  const updateUrl = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const addStep = () => {
    setSteps([...steps, { step_name: "", step_description: "", progress_percentage: 0 }]);
  };

  const removeStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const updateStep = (index: number, field: string, value: string | number) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], [field]: value };
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error } = await supabase.from("projects").insert({
        user_id: user.id,
        is_saas: isSaas,
        system_title: systemTitle,
        urls: urls.filter(url => url.trim() !== ""),
        system_location: systemLocation,
        email,
        password,
        referral_link: referralLink,
        was_referred: wasReferred,
        referral_email: wasReferred ? referralEmail : null,
        has_supabase: hasSupabase,
        supabase_email: hasSupabase ? supabaseEmail : null,
        supabase_password: hasSupabase ? supabasePassword : null,
        supabase_projeto: hasSupabase ? supabaseProjeto : null,
        has_github: hasGithub,
        github_username: hasGithub ? githubUsername : null,
        github_password: hasGithub ? githubPassword : null,
        github_page: hasGithub ? githubPage : null,
        github_url: hasGithub ? githubUrl : null,
        general_progress: generalProgress,
        notes,
      }).select();

      if (error) {
        throw error;
      }

      // Insert project steps if project was created successfully
      if (data && data.length > 0 && steps.length > 0) {
        const projectId = data[0].id;
        const stepsToInsert = steps
          .filter(step => step.step_name.trim() !== "")
          .map((step, index) => ({
            project_id: projectId,
            step_name: step.step_name,
            step_description: step.step_description,
            progress_percentage: step.progress_percentage,
            order_index: index
          }));

        if (stepsToInsert.length > 0) {
          const { error: stepsError } = await supabase
            .from("project_steps")
            .insert(stepsToInsert);
          
          if (stepsError) {
            console.error("Error inserting steps:", stepsError);
          }
        }
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar projeto",
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
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-xl">
            <Plus className="w-6 h-6 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">Novo Projeto</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Preencha os dados do seu projeto</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Informações Básicas */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="text-primary">Informações Básicas</CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is-saas"
                checked={isSaas}
                onCheckedChange={setIsSaas}
              />
              <Label htmlFor="is-saas">Projeto SaaS?</Label>
            </div>

            <div>
              <Label htmlFor="system-title">Título do Sistema*</Label>
              <Input
                id="system-title"
                value={systemTitle}
                onChange={(e) => setSystemTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <Label>URLs</Label>
              {urls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={url}
                    onChange={(e) => updateUrl(index, e.target.value)}
                    placeholder="https://exemplo.com"
                  />
                  {urls.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeUrl(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addUrl}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar URL
              </Button>
            </div>

            <div>
              <Label htmlFor="system-location">Local do Sistema</Label>
              <Input
                id="system-location"
                value={systemLocation}
                onChange={(e) => setSystemLocation(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

            {/* Credenciais Principais */}
            <Card className="modern-card">
              <CardHeader>
                <CardTitle className="text-primary">Credenciais Principais</CardTitle>
              </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="referral-link">Link de Indicação</Label>
              <Input
                id="referral-link"
                value={referralLink}
                onChange={(e) => setReferralLink(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="was-referred"
                  checked={wasReferred}
                  onCheckedChange={setWasReferred}
                />
                <Label htmlFor="was-referred">Foi indicado?</Label>
              </div>
              
              {wasReferred && (
                <div>
                  <Label htmlFor="referral-email">Email do indicador</Label>
                  <Input
                    id="referral-email"
                    type="email"
                    value={referralEmail}
                    onChange={(e) => setReferralEmail(e.target.value)}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Supabase */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="text-primary">Supabase</CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="has-supabase"
              checked={hasSupabase}
              onCheckedChange={setHasSupabase}
            />
            <Label htmlFor="has-supabase">Possui Supabase?</Label>
          </div>

          {hasSupabase && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="supabase-email">Email Supabase</Label>
                <Input
                  id="supabase-email"
                  type="email"
                  value={supabaseEmail}
                  onChange={(e) => setSupabaseEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supabase-password">Senha Supabase</Label>
                <Input
                  id="supabase-password"
                  type="password"
                  value={supabasePassword}
                  onChange={(e) => setSupabasePassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="supabase-projeto">Projeto</Label>
                <Input
                  id="supabase-projeto"
                  value={supabaseProjeto}
                  onChange={(e) => setSupabaseProjeto(e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

          {/* GitHub */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="text-primary">GitHub</CardTitle>
            </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="has-github"
              checked={hasGithub}
              onCheckedChange={setHasGithub}
            />
            <Label htmlFor="has-github">Possui GitHub?</Label>
          </div>

          {hasGithub && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github-username">Username GitHub</Label>
                  <Input
                    id="github-username"
                    value={githubUsername}
                    onChange={(e) => setGithubUsername(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="github-password">Senha GitHub</Label>
                  <Input
                    id="github-password"
                    type="password"
                    value={githubPassword}
                    onChange={(e) => setGithubPassword(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="github-page">Página</Label>
                  <Input
                    id="github-page"
                    value={githubPage}
                    onChange={(e) => setGithubPage(e.target.value)}
                    placeholder="Ex: minha-empresa"
                  />
                </div>
                <div>
                  <Label htmlFor="github-url">URL Git</Label>
                  <Input
                    id="github-url"
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    placeholder="https://github.com/usuario/repositorio"
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

          {/* Observações */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="text-primary">Observações</CardTitle>
            </CardHeader>
        <CardContent>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Adicione suas observações aqui..."
            rows={4}
          />
        </CardContent>
      </Card>

          {/* Progresso do Projeto */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="text-primary flex items-center gap-2">
                <Target className="w-5 h-5" />
                Progresso do Projeto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="general-progress">Progresso Geral (%)</Label>
                <div className="space-y-2">
                  <Input
                    id="general-progress"
                    type="number"
                    min="0"
                    max="100"
                    value={generalProgress}
                    onChange={(e) => setGeneralProgress(Number(e.target.value))}
                    placeholder="0"
                  />
                  <Progress value={generalProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground">{generalProgress}% concluído</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Etapas do Projeto */}
          <Card className="modern-card">
            <CardHeader>
              <CardTitle className="text-primary">Etapas do Projeto</CardTitle>
              <p className="text-sm text-muted-foreground">Gerencie as etapas e progresso individual</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {steps.map((step, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Etapa {index + 1}</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(index)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label>Nome da Etapa</Label>
                      <Input
                        value={step.step_name}
                        onChange={(e) => updateStep(index, 'step_name', e.target.value)}
                        placeholder="Ex: Desenvolvimento inicial"
                      />
                    </div>
                    <div>
                      <Label>Progresso (%)</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        value={step.progress_percentage}
                        onChange={(e) => updateStep(index, 'progress_percentage', Number(e.target.value))}
                        placeholder="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label>Descrição</Label>
                    <Textarea
                      value={step.step_description}
                      onChange={(e) => updateStep(index, 'step_description', e.target.value)}
                      placeholder="Descreva os detalhes desta etapa..."
                      rows={2}
                    />
                  </div>
                  
                  <Progress value={step.progress_percentage} className="h-2" />
                </div>
              ))}
              
              <Button
                type="button"
                variant="outline"
                onClick={addStep}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Etapa
              </Button>
            </CardContent>
          </Card>

          <Separator />

          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !systemTitle.trim()} className="btn-modern">
              {loading ? "Salvando..." : "Salvar Projeto"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};