# 🎨 Sistema de Design MyMemorize

## Visão Geral

Este documento descreve o sistema de design tokens implementado para garantir consistência visual em toda a aplicação.

---

## 🎨 Paleta de Cores

### Primária - Azul Confiável
- **Principal**: `#2563EB` (Blue 600) - Confiança, tecnologia
- **Hover**: `#1D4ED8` (Blue 700)
- **Light**: `#DBEAFE` (Blue 100)
- **Uso**: Botões primários, links, elementos de destaque

### Secundária - Cinza Suave
- **Principal**: `#F3F4F6` (Gray 100)
- **Uso**: Backgrounds secundários, cards

### Acento - Verde Sucesso
- **Principal**: `#10B981` (Emerald 500) - Sucesso, progresso
- **Hover**: `#059669` (Emerald 600)
- **Uso**: Confirmações, sucesso, progresso positivo

### Neutras
- **Background**: `#F9FAFB` (Gray 50)
- **Card**: `#FFFFFF`
- **Text**: `#111827` (Gray 900)
- **Muted**: `#6B7280` (Gray 500)
- **Border**: `#E5E7EB` (Gray 200)

---

## 📝 Tipografia

### Hierarquia

```tsx
// H1 - Títulos principais
<h1 className="text-4xl font-bold tracking-tight">
  Título Principal
</h1>

// H2 - Seções
<h2 className="text-3xl font-semibold tracking-tight">
  Seção
</h2>

// H3 - Subseções
<h3 className="text-2xl font-semibold">
  Subseção
</h3>

// H4
<h4 className="text-xl font-semibold">
  Subtítulo
</h4>

// Body - Texto padrão
<p className="text-base">
  Texto do corpo
</p>

// Body Large
<p className="text-lg">
  Texto maior
</p>

// Small - Labels, hints
<span className="text-sm text-muted-foreground">
  Texto pequeno
</span>

// Tiny
<span className="text-xs text-muted-foreground">
  Texto muito pequeno
</span>
```

### Fonte
- **Padrão**: Inter (já configurada)
- **Monospace**: Menlo (para código/exemplos)

---

## 📏 Espaçamento

### Sistema de Escala (baseado em 4px)

```tsx
// Elementos relacionados
<div className="space-y-4"> {/* 16px */}
  <Item />
  <Item />
</div>

// Seções
<div className="space-y-6"> {/* 24px */}
  <Section />
  <Section />
</div>

// Páginas
<div className="space-y-8"> {/* 32px */}
  <PageSection />
</div>
```

### Padding em Cards

```tsx
// Cards padrão
<Card className="p-6"> {/* 24px */}
  Conteúdo
</Card>

// Cards compactos
<Card className="p-4"> {/* 16px */}
  Conteúdo compacto
</Card>
```

---

## 🔲 Bordas e Radius

### Border Radius

```tsx
// Cards (padrão)
<Card className="rounded-lg"> {/* 12px */}
  Conteúdo
</Card>

// Botões
<Button className="rounded-md"> {/* 8px */}
  Botão
</Button>

// Inputs
<Input className="rounded-sm"> {/* 4px */}
  Input
</Input>
```

### Bordas

```tsx
// Padrão (1px)
<div className="border border-border">
  Conteúdo
</div>

// Espessa (2px) - apenas quando necessário
<div className="border-2 border-primary">
  Destaque
</div>
```

---

## 🌑 Sombras

### Sistema Reduzido

```tsx
// Cards padrão
<Card className="shadow-sm">
  Conteúdo
</Card>

// Modals
<Dialog className="shadow-md">
  Conteúdo
</Dialog>

// Elementos elevados
<div className="shadow-lg">
  Conteúdo elevado
</div>
```

**❌ NÃO USAR:**
- `shadow-xl`
- `shadow-2xl`
- `glow-primary` (classe customizada com glow excessivo)

---

## 🎯 Botões

### Estilos Padronizados

```tsx
// Botão Primário (sólido)
<Button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Ação Principal
</Button>

// Botão Secundário
<Button variant="secondary">
  Ação Secundária
</Button>

// Botão Outline
<Button variant="outline">
  Ação Alternativa
</Button>

// Botão Ghost
<Button variant="ghost">
  Ação Sutil
</Button>
```

**❌ NÃO USAR:**
- Gradientes em botões (`gradient-primary`)
- Sombras excessivas (`shadow-xl`, `glow-primary`)

---

## 📦 Cards

### Padrão

```tsx
<Card className="p-6 rounded-lg shadow-sm border border-border">
  <CardHeader>
    <CardTitle className="text-2xl font-semibold">
      Título
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">
    <p className="text-base text-muted-foreground">
      Conteúdo
    </p>
  </CardContent>
</Card>
```

**Padrões:**
- Padding: `p-6` (padrão) ou `p-4` (compacto)
- Border radius: `rounded-lg` (12px)
- Shadow: `shadow-sm`
- Border: `border border-border`

---

## ✅ Checklist de Consistência

Ao criar ou modificar componentes, verifique:

- [ ] Cores seguem a paleta profissional (azul primário, não roxo vibrante)
- [ ] Tipografia usa hierarquia consistente (h1, h2, h3, body, small)
- [ ] Espaçamento segue escala (4, 8, 12, 16, 24, 32px)
- [ ] Cards usam `p-6` ou `p-4` (não `p-5` ou outros valores)
- [ ] Sombras são `shadow-sm`, `shadow-md` ou `shadow-lg` (não `shadow-xl` ou `shadow-2xl`)
- [ ] Bordas são `border` (1px) ou `border-2` (2px) quando necessário
- [ ] Botões não usam gradientes excessivos
- [ ] Não há uso de `glow-primary` ou classes similares

---

## 🔄 Migração

### Antes (Inconsistente)
```tsx
<Card className="p-5 shadow-2xl glow-primary border-2">
  <h1 className="text-5xl font-extrabold bg-gradient-to-r from-purple-500 to-cyan-500">
    Título
  </h1>
</Card>
```

### Depois (Consistente)
```tsx
<Card className="p-6 shadow-sm border border-border">
  <h1 className="text-4xl font-bold text-foreground">
    Título
  </h1>
</Card>
```

---

## 📚 Referências

- [Tailwind UI](https://tailwindui.com/)
- [Linear Design System](https://linear.app/)
- [Vercel Design](https://vercel.com/design)

---

**Última atualização**: Baseado na análise profissional de UX/UI (ANALISE_MYMEMORIZE.md)

