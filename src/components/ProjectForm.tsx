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
import { Plus, Trash2 } from "lucide-react";

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
  const [supabaseProjeto, setSupabaseProjeto] = useState("");
  const [notes, setNotes] = useState("");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { error } = await supabase.from("projects").insert({
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
        notes,
      });

      if (error) {
        throw error;
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
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informações Básicas */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
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
        <Card>
          <CardHeader>
            <CardTitle>Credenciais Principais</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>Supabase</CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle>GitHub</CardTitle>
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
          )}
        </CardContent>
      </Card>

      {/* Observações */}
      <Card>
        <CardHeader>
          <CardTitle>Observações</CardTitle>
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

      <Separator />

      <div className="flex gap-4 justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading || !systemTitle.trim()}>
          {loading ? "Salvando..." : "Salvar Projeto"}
        </Button>
      </div>
    </form>
  );
};