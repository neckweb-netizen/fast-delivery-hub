export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          criado_em: string | null
          data_hora: string
          empresa_id: string | null
          id: string
          observacoes: string | null
          servico_id: string | null
          status: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          data_hora: string
          empresa_id?: string | null
          id?: string
          observacoes?: string | null
          servico_id?: string | null
          status?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          data_hora?: string
          empresa_id?: string | null
          id?: string
          observacoes?: string | null
          servico_id?: string | null
          status?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          changed_by: string | null
          created_at: string | null
          id: string
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
        }
        Insert: {
          action: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Update: {
          action?: string
          changed_by?: string | null
          created_at?: string | null
          id?: string
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
        }
        Relationships: []
      }
      avaliacoes: {
        Row: {
          aprovada: boolean | null
          comentario: string | null
          criado_em: string | null
          empresa_id: string | null
          id: string
          nota: number | null
          usuario_id: string | null
        }
        Insert: {
          aprovada?: boolean | null
          comentario?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          nota?: number | null
          usuario_id?: string | null
        }
        Update: {
          aprovada?: boolean | null
          comentario?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          nota?: number | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "avaliacoes_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      avisos_sistema: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          id: string
          mensagem: string | null
          tipo: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          mensagem?: string | null
          tipo?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          id?: string
          mensagem?: string | null
          tipo?: string | null
          titulo?: string
        }
        Relationships: []
      }
      banners: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          imagem_url: string | null
          link: string | null
          ordem: number | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          imagem_url?: string | null
          link?: string | null
          ordem?: number | null
          titulo?: string
        }
        Relationships: []
      }
      canal_informativo: {
        Row: {
          ativo: boolean | null
          autor_id: string | null
          categoria: string | null
          conteudo: string | null
          criado_em: string | null
          id: string
          imagem_url: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          autor_id?: string | null
          categoria?: string | null
          conteudo?: string | null
          criado_em?: string | null
          id?: string
          imagem_url?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          autor_id?: string | null
          categoria?: string | null
          conteudo?: string | null
          criado_em?: string | null
          id?: string
          imagem_url?: string | null
          titulo?: string
        }
        Relationships: []
      }
      categorias: {
        Row: {
          ativo: boolean | null
          cor: string | null
          criado_em: string | null
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number | null
          slug: string | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number | null
          slug?: string | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          criado_em?: string | null
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number | null
          slug?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      categorias_oportunidades: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          id: string
          nome: string
          slug: string | null
          tipo: string | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          id?: string
          nome: string
          slug?: string | null
          tipo?: string | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          id?: string
          nome?: string
          slug?: string | null
          tipo?: string | null
        }
        Relationships: []
      }
      cidades: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          estado: string
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          estado?: string
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          estado?: string
          id?: string
          nome?: string
        }
        Relationships: []
      }
      comentarios_problema: {
        Row: {
          comentario: string
          criado_em: string | null
          id: string
          problema_id: string | null
          usuario_id: string | null
        }
        Insert: {
          comentario: string
          criado_em?: string | null
          id?: string
          problema_id?: string | null
          usuario_id?: string | null
        }
        Update: {
          comentario?: string
          criado_em?: string | null
          id?: string
          problema_id?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comentarios_problema_problema_id_fkey"
            columns: ["problema_id"]
            isOneToOne: false
            referencedRelation: "problemas_cidade"
            referencedColumns: ["id"]
          },
        ]
      }
      cupons: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          limite_uso: number | null
          tipo_desconto: string | null
          titulo: string
          usos: number | null
          valor_desconto: number | null
          valor_minimo: number | null
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          limite_uso?: number | null
          tipo_desconto?: string | null
          titulo: string
          usos?: number | null
          valor_desconto?: number | null
          valor_minimo?: number | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          limite_uso?: number | null
          tipo_desconto?: string | null
          titulo?: string
          usos?: number | null
          valor_desconto?: number | null
          valor_minimo?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cupons_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresa_admins: {
        Row: {
          criado_em: string | null
          empresa_id: string | null
          id: string
          role: string | null
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          role?: string | null
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          role?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresa_admins_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      empresas: {
        Row: {
          aprovada: boolean | null
          ativo: boolean | null
          atualizado_em: string | null
          capa_url: string | null
          categoria_id: string | null
          cidade_id: string | null
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          email: string | null
          endereco: string | null
          facebook: string | null
          horario_funcionamento: Json | null
          id: string
          instagram: string | null
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          media_avaliacoes: number | null
          nome: string
          plano_atual_id: string | null
          plano_data_inicio: string | null
          plano_data_vencimento: string | null
          slug: string | null
          telefone: string | null
          total_avaliacoes: number | null
          usuario_id: string | null
          visualizacoes: number | null
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          aprovada?: boolean | null
          ativo?: boolean | null
          atualizado_em?: string | null
          capa_url?: string | null
          categoria_id?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          email?: string | null
          endereco?: string | null
          facebook?: string | null
          horario_funcionamento?: Json | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          media_avaliacoes?: number | null
          nome: string
          plano_atual_id?: string | null
          plano_data_inicio?: string | null
          plano_data_vencimento?: string | null
          slug?: string | null
          telefone?: string | null
          total_avaliacoes?: number | null
          usuario_id?: string | null
          visualizacoes?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          aprovada?: boolean | null
          ativo?: boolean | null
          atualizado_em?: string | null
          capa_url?: string | null
          categoria_id?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          email?: string | null
          endereco?: string | null
          facebook?: string | null
          horario_funcionamento?: Json | null
          id?: string
          instagram?: string | null
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          media_avaliacoes?: number | null
          nome?: string
          plano_atual_id?: string | null
          plano_data_inicio?: string | null
          plano_data_vencimento?: string | null
          slug?: string | null
          telefone?: string | null
          total_avaliacoes?: number | null
          usuario_id?: string | null
          visualizacoes?: number | null
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "empresas_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "empresas_plano_atual_id_fkey"
            columns: ["plano_atual_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      enderecos_empresa: {
        Row: {
          cep: string | null
          cidade: string | null
          criado_em: string | null
          empresa_id: string | null
          endereco: string
          estado: string | null
          id: string
          latitude: number | null
          longitude: number | null
          nome: string | null
          principal: boolean | null
        }
        Insert: {
          cep?: string | null
          cidade?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          endereco: string
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string | null
          principal?: boolean | null
        }
        Update: {
          cep?: string | null
          cidade?: string | null
          criado_em?: string | null
          empresa_id?: string | null
          endereco?: string
          estado?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          nome?: string | null
          principal?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "enderecos_empresa_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      enquetes: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          data_fim: string | null
          id: string
          opcoes: Json | null
          pergunta: string
          votos: Json | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          id?: string
          opcoes?: Json | null
          pergunta: string
          votos?: Json | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          data_fim?: string | null
          id?: string
          opcoes?: Json | null
          pergunta?: string
          votos?: Json | null
        }
        Relationships: []
      }
      eventos: {
        Row: {
          ativo: boolean | null
          categoria_id: string | null
          criado_em: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          destaque: boolean | null
          empresa_id: string | null
          endereco: string | null
          id: string
          imagem_url: string | null
          link_ingresso: string | null
          local: string | null
          preco: number | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          categoria_id?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          destaque?: boolean | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          link_ingresso?: string | null
          local?: string | null
          preco?: number | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          categoria_id?: string | null
          criado_em?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          destaque?: boolean | null
          empresa_id?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          link_ingresso?: string | null
          local?: string | null
          preco?: number | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "eventos_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "eventos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      favoritos: {
        Row: {
          criado_em: string | null
          empresa_id: string | null
          id: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "favoritos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      home_sections_order: {
        Row: {
          ativo: boolean | null
          config: Json | null
          criado_em: string | null
          id: string
          ordem: number | null
          section_key: string
        }
        Insert: {
          ativo?: boolean | null
          config?: Json | null
          criado_em?: string | null
          id?: string
          ordem?: number | null
          section_key: string
        }
        Update: {
          ativo?: boolean | null
          config?: Json | null
          criado_em?: string | null
          id?: string
          ordem?: number | null
          section_key?: string
        }
        Relationships: []
      }
      lugares_publicos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          cidade_id: string | null
          criado_em: string | null
          descricao: string | null
          endereco: string | null
          id: string
          imagem_url: string | null
          latitude: number | null
          longitude: number | null
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          latitude?: number | null
          longitude?: number | null
          nome: string
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          latitude?: number | null
          longitude?: number | null
          nome?: string
        }
        Relationships: [
          {
            foreignKeyName: "lugares_publicos_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_configuracoes: {
        Row: {
          ativo: boolean | null
          config: Json | null
          criado_em: string | null
          id: string
          nome: string
        }
        Insert: {
          ativo?: boolean | null
          config?: Json | null
          criado_em?: string | null
          id?: string
          nome: string
        }
        Update: {
          ativo?: boolean | null
          config?: Json | null
          criado_em?: string | null
          id?: string
          nome?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          criado_em: string | null
          id: string
          lida: boolean | null
          link: string | null
          mensagem: string | null
          tipo: string | null
          titulo: string
          usuario_id: string | null
        }
        Insert: {
          criado_em?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo: string
          usuario_id?: string | null
        }
        Update: {
          criado_em?: string | null
          id?: string
          lida?: boolean | null
          link?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string | null
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          criado_em: string | null
          empresa_id: string | null
          id: string
          metodo: string | null
          plano_id: string | null
          referencia_externa: string | null
          status: string | null
          valor: number | null
        }
        Insert: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          metodo?: string | null
          plano_id?: string | null
          referencia_externa?: string | null
          status?: string | null
          valor?: number | null
        }
        Update: {
          criado_em?: string | null
          empresa_id?: string | null
          id?: string
          metodo?: string | null
          plano_id?: string | null
          referencia_externa?: string | null
          status?: string | null
          valor?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_plano_id_fkey"
            columns: ["plano_id"]
            isOneToOne: false
            referencedRelation: "planos"
            referencedColumns: ["id"]
          },
        ]
      }
      planos: {
        Row: {
          acesso_eventos: boolean | null
          ativo: boolean | null
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          duracao_dias: number | null
          id: string
          limite_cupons: number | null
          limite_eventos: number | null
          limite_produtos: number | null
          limite_vagas: number | null
          nome: string
          preco_anual: number | null
          preco_mensal: number | null
          prioridade_destaque: number | null
          produtos_destaque_permitidos: number | null
          stories: boolean | null
          suporte_prioritario: boolean | null
        }
        Insert: {
          acesso_eventos?: boolean | null
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          duracao_dias?: number | null
          id?: string
          limite_cupons?: number | null
          limite_eventos?: number | null
          limite_produtos?: number | null
          limite_vagas?: number | null
          nome: string
          preco_anual?: number | null
          preco_mensal?: number | null
          prioridade_destaque?: number | null
          produtos_destaque_permitidos?: number | null
          stories?: boolean | null
          suporte_prioritario?: boolean | null
        }
        Update: {
          acesso_eventos?: boolean | null
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          duracao_dias?: number | null
          id?: string
          limite_cupons?: number | null
          limite_eventos?: number | null
          limite_produtos?: number | null
          limite_vagas?: number | null
          nome?: string
          preco_anual?: number | null
          preco_mensal?: number | null
          prioridade_destaque?: number | null
          produtos_destaque_permitidos?: number | null
          stories?: boolean | null
          suporte_prioritario?: boolean | null
        }
        Relationships: []
      }
      problemas_cidade: {
        Row: {
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          endereco: string | null
          id: string
          imagem_url: string | null
          latitude: number | null
          longitude: number | null
          resolvido: boolean | null
          status: string | null
          titulo: string
          usuario_id: string | null
          votos: number | null
        }
        Insert: {
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          latitude?: number | null
          longitude?: number | null
          resolvido?: boolean | null
          status?: string | null
          titulo: string
          usuario_id?: string | null
          votos?: number | null
        }
        Update: {
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          endereco?: string | null
          id?: string
          imagem_url?: string | null
          latitude?: number | null
          longitude?: number | null
          resolvido?: boolean | null
          status?: string | null
          titulo?: string
          usuario_id?: string | null
          votos?: number | null
        }
        Relationships: []
      }
      produtos: {
        Row: {
          ativo: boolean | null
          categoria: string | null
          criado_em: string | null
          descricao: string | null
          destaque: boolean | null
          empresa_id: string | null
          id: string
          imagem_url: string | null
          nome: string
          preco: number | null
          preco_promocional: number | null
        }
        Insert: {
          ativo?: boolean | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          empresa_id?: string | null
          id?: string
          imagem_url?: string | null
          nome: string
          preco?: number | null
          preco_promocional?: number | null
        }
        Update: {
          ativo?: boolean | null
          categoria?: string | null
          criado_em?: string | null
          descricao?: string | null
          destaque?: boolean | null
          empresa_id?: string | null
          id?: string
          imagem_url?: string | null
          nome?: string
          preco?: number | null
          preco_promocional?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "produtos_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      security_logs: {
        Row: {
          created_at: string | null
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      short_urls: {
        Row: {
          cliques: number | null
          codigo: string
          criado_em: string | null
          id: string
          url_destino: string
        }
        Insert: {
          cliques?: number | null
          codigo: string
          criado_em?: string | null
          id?: string
          url_destino: string
        }
        Update: {
          cliques?: number | null
          codigo?: string
          criado_em?: string | null
          id?: string
          url_destino?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          empresa_id: string | null
          expira_em: string | null
          id: string
          link: string | null
          media_url: string | null
          tipo: string | null
          titulo: string | null
          visualizacoes: number | null
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          empresa_id?: string | null
          expira_em?: string | null
          id?: string
          link?: string | null
          media_url?: string | null
          tipo?: string | null
          titulo?: string | null
          visualizacoes?: number | null
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          empresa_id?: string | null
          expira_em?: string | null
          id?: string
          link?: string | null
          media_url?: string | null
          tipo?: string | null
          titulo?: string | null
          visualizacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "stories_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          atualizado_em: string | null
          avatar_url: string | null
          badges_count: number | null
          bio: string | null
          cidade_id: string | null
          criado_em: string | null
          current_level: number | null
          data_nascimento: string | null
          email: string
          facebook: string | null
          genero: string | null
          id: string
          instagram: string | null
          interesses: string[] | null
          linkedin: string | null
          mostrar_email: boolean | null
          mostrar_telefone: boolean | null
          nome: string
          perfil_publico: boolean | null
          profissao: string | null
          telefone: string | null
          total_points: number | null
          twitter: string | null
          ultimo_acesso: string | null
          user_id: string
          website: string | null
          whatsapp: string | null
        }
        Insert: {
          atualizado_em?: string | null
          avatar_url?: string | null
          badges_count?: number | null
          bio?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          current_level?: number | null
          data_nascimento?: string | null
          email: string
          facebook?: string | null
          genero?: string | null
          id?: string
          instagram?: string | null
          interesses?: string[] | null
          linkedin?: string | null
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          nome: string
          perfil_publico?: boolean | null
          profissao?: string | null
          telefone?: string | null
          total_points?: number | null
          twitter?: string | null
          ultimo_acesso?: string | null
          user_id: string
          website?: string | null
          whatsapp?: string | null
        }
        Update: {
          atualizado_em?: string | null
          avatar_url?: string | null
          badges_count?: number | null
          bio?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          current_level?: number | null
          data_nascimento?: string | null
          email?: string
          facebook?: string | null
          genero?: string | null
          id?: string
          instagram?: string | null
          interesses?: string[] | null
          linkedin?: string | null
          mostrar_email?: boolean | null
          mostrar_telefone?: boolean | null
          nome?: string
          perfil_publico?: boolean | null
          profissao?: string | null
          telefone?: string | null
          total_points?: number | null
          twitter?: string | null
          ultimo_acesso?: string | null
          user_id?: string
          website?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      usuarios: {
        Row: {
          ativo: boolean | null
          atualizado_em: string | null
          avatar_url: string | null
          cidade_id: string | null
          criado_em: string | null
          email: string
          id: string
          nome: string
          telefone: string | null
          tipo_conta: string | null
        }
        Insert: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          email: string
          id: string
          nome: string
          telefone?: string | null
          tipo_conta?: string | null
        }
        Update: {
          ativo?: boolean | null
          atualizado_em?: string | null
          avatar_url?: string | null
          cidade_id?: string | null
          criado_em?: string | null
          email?: string
          id?: string
          nome?: string
          telefone?: string | null
          tipo_conta?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "usuarios_cidade_id_fkey"
            columns: ["cidade_id"]
            isOneToOne: false
            referencedRelation: "cidades"
            referencedColumns: ["id"]
          },
        ]
      }
      vagas: {
        Row: {
          ativo: boolean | null
          criado_em: string | null
          descricao: string | null
          empresa_id: string | null
          id: string
          local: string | null
          remoto: boolean | null
          requisitos: string | null
          salario: string | null
          tipo_contrato: string | null
          titulo: string
        }
        Insert: {
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          local?: string | null
          remoto?: boolean | null
          requisitos?: string | null
          salario?: string | null
          tipo_contrato?: string | null
          titulo: string
        }
        Update: {
          ativo?: boolean | null
          criado_em?: string | null
          descricao?: string | null
          empresa_id?: string | null
          id?: string
          local?: string | null
          remoto?: boolean | null
          requisitos?: string | null
          salario?: string | null
          tipo_contrato?: string | null
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "vagas_empresa_id_fkey"
            columns: ["empresa_id"]
            isOneToOne: false
            referencedRelation: "empresas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_public_user_profile: {
        Args: { user_id_param: string }
        Returns: {
          avatar_url: string
          badges_count: number
          bio: string
          criado_em: string
          current_level: number
          email: string
          facebook: string
          id: string
          instagram: string
          interesses: string[]
          linkedin: string
          nome: string
          profissao: string
          telefone: string
          total_points: number
          twitter: string
          user_id: string
          website: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
