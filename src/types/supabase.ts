
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {

  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_log": {
                  Row: {
                    "action": string,"actor_id": string | null,"id": number,"new_data": Json | null,"occurred_at": string,"old_data": Json | null,"record_id": string,"table_name": string
                  }
                  Insert: {
                    "action": string,"actor_id"?: string | null,"id"?: never,"new_data"?: Json | null,"occurred_at"?: string,"old_data"?: Json | null,"record_id": string,"table_name": string
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"id"?: never,"new_data"?: Json | null,"occurred_at"?: string,"old_data"?: Json | null,"record_id"?: string,"table_name"?: string
                  }
                  Relationships: [

                  ]
                },"donations": {
                  Row: {
                    "amount": number | null,"category": string | null,"concept": string | null,"created_at": string,"created_by": string | null,"currency": string | null,"donated_at": string,"donor_id": string | null,"id": string,"item_description": string | null,"kind": string,"method": string | null,"notes": string | null,"quantity": number | null,"unit": string | null,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "amount"?: number | null,"category"?: string | null,"concept"?: string | null,"created_at"?: string,"created_by"?: string | null,"currency"?: string | null,"donated_at"?: string,"donor_id"?: string | null,"id"?: string,"item_description"?: string | null,"kind"?: string,"method"?: string | null,"notes"?: string | null,"quantity"?: number | null,"unit"?: string | null,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "amount"?: number | null,"category"?: string | null,"concept"?: string | null,"created_at"?: string,"created_by"?: string | null,"currency"?: string | null,"donated_at"?: string,"donor_id"?: string | null,"id"?: string,"item_description"?: string | null,"kind"?: string,"method"?: string | null,"notes"?: string | null,"quantity"?: number | null,"unit"?: string | null,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "donations_category_fkey"
      columns: ["category"]
isOneToOne: false
      referencedRelation: "supply_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "donations_donor_id_fkey"
      columns: ["donor_id"]
isOneToOne: false
      referencedRelation: "donor_overview"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "donations_donor_id_fkey"
      columns: ["donor_id"]
isOneToOne: false
      referencedRelation: "donors"
      referencedColumns: ["id"]
    }
                  ]
                },"donors": {
                  Row: {
                    "created_at": string,"created_by": string | null,"email": string | null,"full_name": string,"id": string,"notes": string | null,"phone": string | null,"updated_at": string,"updated_by": string | null
                  }
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"email"?: string | null,"full_name": string,"id"?: string,"notes"?: string | null,"phone"?: string | null,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"email"?: string | null,"full_name"?: string,"id"?: string,"notes"?: string | null,"phone"?: string | null,"updated_at"?: string,"updated_by"?: string | null
                  }
                  Relationships: [

                  ]
                },"profiles": {
                  Row: {
                    "created_at": string,"full_name": string | null,"id": string,"role": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"full_name"?: string | null,"id": string,"role"?: string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"full_name"?: string | null,"id"?: string,"role"?: string,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"supply_categories": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"updated_at": string
                  }
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                }
          }
          Views: {
            "donation_list": {
                  Row: {
                    "amount": number | null,"category": string | null,"category_name": string | null,"concept": string | null,"created_at": string | null,"created_by": string | null,"created_by_name": string | null,"currency": string | null,"donated_at": string | null,"donor_id": string | null,"donor_name": string | null,"id": string | null,"item_description": string | null,"kind": string | null,"method": string | null,"notes": string | null,"quantity": number | null,"unit": string | null,"updated_at": string | null,"updated_by": string | null,"updated_by_name": string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "donations_category_fkey"
      columns: ["category"]
isOneToOne: false
      referencedRelation: "supply_categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "donations_donor_id_fkey"
      columns: ["donor_id"]
isOneToOne: false
      referencedRelation: "donor_overview"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "donations_donor_id_fkey"
      columns: ["donor_id"]
isOneToOne: false
      referencedRelation: "donors"
      referencedColumns: ["id"]
    }
                  ]
                },"donor_overview": {
                  Row: {
                    "created_at": string | null,"donation_count": number | null,"email": string | null,"full_name": string | null,"id": string | null,"last_donation_date": string | null,"money_count": number | null,"money_totals": Json | null,"notes": string | null,"phone": string | null,"supplies_count": number | null,"updated_at": string | null
                  }
                  Relationships: [

                  ]
                }
          }
          Functions: {
            "donation_filter_options":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
"donation_summary":
{ Args: { "p_category"?: string,"p_currency"?: string,"p_from"?: string,"p_kind"?: string,"p_method"?: string,"p_query"?: string,"p_to"?: string }; Returns: {
              "currency": string,"donation_count": number,"kind": string,"total": number
            }[]
                           },
"ensure_donor":
{ Args: { "p_full_name": string }; Returns: string
                           },
"get_donation_dashboard":
{ Args: { "p_currency"?: string,"p_kind"?: string }; Returns: Json
                           },
"search_donations":
{ Args: { "p_category"?: string,"p_currency"?: string,"p_from"?: string,"p_kind"?: string,"p_method"?: string,"p_query"?: string,"p_to"?: string }; Returns: {
              "amount": number | null,
"category": string | null,
"category_name": string | null,
"concept": string | null,
"created_at": string | null,
"created_by": string | null,
"created_by_name": string | null,
"currency": string | null,
"donated_at": string | null,
"donor_id": string | null,
"donor_name": string | null,
"id": string | null,
"item_description": string | null,
"kind": string | null,
"method": string | null,
"notes": string | null,
"quantity": number | null,
"unit": string | null,
"updated_at": string | null,
"updated_by": string | null,
"updated_by_name": string | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "donation_list"
        isOneToOne: false
        isSetofReturn: true
      } },
"search_donors":
{ Args: { "p_currency"?: string,"p_query"?: string,"p_sort"?: string }; Returns: {
              "created_at": string | null,
"donation_count": number | null,
"email": string | null,
"full_name": string | null,
"id": string | null,
"last_donation_date": string | null,
"money_count": number | null,
"money_totals": Json | null,
"notes": string | null,
"phone": string | null,
"supplies_count": number | null,
"updated_at": string | null
            }[]
                          SetofOptions: {
        from: "*"
        to: "donor_overview"
        isOneToOne: false
        isSetofReturn: true
      } }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {

          }
        },"public": {
          Enums: {

          }
        }
} as const
