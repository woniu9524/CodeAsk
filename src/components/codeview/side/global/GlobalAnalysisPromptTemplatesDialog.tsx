import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useGlobalAnalysisStore } from "@/store/useGlobalAnalysisStore";
import { useTranslation } from "react-i18next";
import { Eye } from "lucide-react";

interface GlobalAnalysisPromptTemplate {
  name: string;
  singlePageAnalysis: {
    prompt: string;
  };
  summaryAnalysis: {
    prompt: string;
  };
}

interface GlobalAnalysisPromptTemplatesDialogProps {
  children: React.ReactNode;
}

const templates: Record<string, Record<string, GlobalAnalysisPromptTemplate>> = {
  zh: {
    "需求文档": {
      name: "需求文档",
      singlePageAnalysis: {
        prompt: `请简要分析此代码文件，提供以下要点：
1. 核心功能和目的（50字内）
2. 主要功能模块列表
3. 输入输出及系统交互方式
4. 关键技术依赖
请保持简洁，总字数不超过100字。`
      },
      summaryAnalysis: {
        prompt: `基于各文件的功能概要，请撰写一份专业的产品需求文档（PRD）。文档结构如下：

1. **产品概述**
   - 产品背景与价值
   - 目标用户群体
   - 核心价值主张
   - 市场定位

2. **功能规格**
   - 核心功能模块
   - 功能架构图（使用Mermaid）
   - 详细功能描述
   - 功能优先级矩阵

3. **用户场景**
   - 典型用户画像
   - 用户旅程地图
   - 关键场景用例

4. **技术架构**
   - 系统架构图（使用Mermaid）
   - 核心业务流程图
   - 技术栈清单
   - 外部依赖说明

5. **接口规范**
   - 系统集成方案
   - 数据流转说明
   - 关键接口定义`
      }
    },
    "技术债务报告": {
      name: "技术债务报告",
      singlePageAnalysis: {
        prompt: `请简要分析此代码文件的技术债务：
1. 代码质量问题（重复代码、复杂度）
2. 性能隐患
3. 文档完整性
4. 最佳实践符合度
请保持简洁，总字数不超过50字。`
      },
      summaryAnalysis: {
        prompt: `基于代码分析结果，生成专业的技术债务评估报告：

1. **技术债务概览**
   - 债务分类统计
   - 严重程度分布
   - 影响范围评估
   - 技术债务热力图

2. **详细分析**
   - 代码质量指标
   - 性能瓶颈分析
   - 架构隐患评估
   - 安全风险排查

3. **优先级评估**
   - 评估矩阵
   - ROI分析
   - 修复成本估算
   - 风险影响评级

4. **改进方案**
   - 短期优化建议
   - 长期重构计划
   - 具体实施步骤
   - 收益预期分析

5. **监控指标**
   - 关键指标定义
   - 监控方案
   - 告警阈值
   - 评估周期`
      }
    },
    "安全分析报告": {
      name: "安全分析报告",
      singlePageAnalysis: {
        prompt: `请简要分析此代码文件的安全隐患：
1. 常见安全漏洞
2. 数据安全问题
3. 权限控制缺陷
如无明显问题直接回答"未发现明显安全隐患"。总字数不超过50字。`
      },
      summaryAnalysis: {
        prompt: `基于安全分析结果，生成专业的安全评估报告：

1. **安全风险概览**
   - 风险等级分布
   - 漏洞类型统计
   - OWASP Top 10对照
   - 整体安全评分

2. **漏洞详情**
   - 漏洞描述
   - 影响范围
   - 利用难度
   - 危害程度

3. **风险评估**
   - CVSS评分
   - 攻击向量分析
   - 威胁模型
   - 风险暴露面

4. **修复方案**
   - 应急修复建议
   - 长期防护策略
   - 最佳实践指南
   - 安全加固方案

5. **安全治理**
   - 安全开发流程
   - 代码审查要点
   - 持续监控方案
   - 应急响应预案`
      }
    },
    "API文档": {
      name: "API文档",
      singlePageAnalysis: {
        prompt: `请分析以下代码文件，提取所有定义的API接口，并为每个接口提供详细描述。请包括：
1. 每个API接口的路径、请求方法（GET/POST等）及功能描述。
2. 请求参数，包括参数名称、类型、是否必需及默认值。
3. 响应格式，包括字段名称、类型和说明。
4. 错误码及其对应的含义。
如果没有直接回答没有。`
      },
      summaryAnalysis: {
        prompt: `以下是从代码文件提取的API接口信息。请基于这些信息，生成一份API文档。文档应包括：
1. **API接口列表**：列出所有API接口，包含路径、方法、功能描述、请求参数和响应数据格式。
2. **请求示例**：为每个API接口提供一个请求示例，包括请求方法、路径、请求参数等。
3. **响应示例**：为每个API接口提供响应示例，展示返回的数据格式及其字段。
4. **错误处理**：列出所有可能的错误码，并解释每个错误的含义和应对方式。`
      }
    },
    "用户行为分析": {
      name: "用户行为分析",
      singlePageAnalysis: {
        prompt: `请分析以下代码文件，提取其中的功能模块，并推测用户可能的行为。请提供以下内容：
1. 该文件的主要功能模块和每个模块的作用。
2. 用户在使用这些功能时可能的操作路径和行为流程。
3. 是否有用户体验痛点，如功能复杂、交互不友好等？
4. 是否存在用户行为预测或日志记录的功能？用户如何与系统交互？
5. 是否有任何流程可简化或优化，以提高用户体验？`
      },
      summaryAnalysis: {
        prompt: `以下是从代码文件提取的用户行为分析信息。请基于这些信息，生成一份用户行为分析报告。报告应包括：
1. **用户行为流程**：展示用户在系统中执行任务的流程，包括关键功能的使用路径。
2. **用户痛点分析**：分析可能存在的用户痛点，例如功能的复杂性或不直观的交互。
3. **优化建议**：基于用户行为分析，提供功能优化和流程改进的建议，帮助提升用户体验。
4. **数据追踪**：列出系统如何追踪用户行为及其应用（例如：事件日志、分析工具等）。`
      }
    }
  },
  en: {
    "Requirements Doc": {
      name: "Requirements Document",
      singlePageAnalysis: {
        prompt: `Please analyze this code file and provide the following points:
1. Core functionality and purpose (within 50 words)
2. List of main functional modules
3. Input/output and system interaction methods
4. Key technical dependencies
Please keep it concise, total word count under 100.`
      },
      summaryAnalysis: {
        prompt: `Based on the functional overview of each file, please write a professional Product Requirements Document (PRD). Document structure:

1. **Product Overview**
   - Product background and value
   - Target user groups
   - Core value proposition
   - Market positioning

2. **Functional Specifications**
   - Core functional modules
   - Functional architecture diagram (using Mermaid)
   - Detailed feature descriptions
   - Feature priority matrix

3. **User Scenarios**
   - Typical user personas
   - User journey map
   - Key use cases

4. **Technical Architecture**
   - System architecture diagram (using Mermaid)
   - Core business flow
   - Tech stack list
   - External dependencies

5. **Interface Specifications**
   - System integration plan
   - Data flow description
   - Key interface definitions`
      }
    },
    "Tech Debt Report": {
      name: "Technical Debt Report",
      singlePageAnalysis: {
        prompt: `Please briefly analyze the technical debt in this code file:
1. Code quality issues (code duplication, complexity)
2. Performance concerns
3. Documentation completeness
4. Best practices compliance
Please keep it concise, total word count under 50.`
      },
      summaryAnalysis: {
        prompt: `Based on the code analysis results, generate a professional technical debt assessment report:

1. **Technical Debt Overview**
   - Debt classification statistics
   - Severity distribution
   - Impact scope assessment
   - Technical debt heat map

2. **Detailed Analysis**
   - Code quality metrics
   - Performance bottleneck analysis
   - Architectural risk assessment
   - Security risk review

3. **Priority Assessment**
   - Assessment matrix
   - ROI analysis
   - Fix cost estimation
   - Risk impact rating

4. **Improvement Plan**
   - Short-term optimization suggestions
   - Long-term refactoring plan
   - Implementation steps
   - Expected benefits analysis

5. **Monitoring Metrics**
   - Key indicator definitions
   - Monitoring plan
   - Alert thresholds
   - Assessment cycle`
      }
    },
    "Security Report": {
      name: "Security Analysis Report",
      singlePageAnalysis: {
        prompt: `Please analyze the security vulnerabilities in this code file:
1. Common security vulnerabilities
2. Data security issues
3. Access control deficiencies
If no obvious issues are found, simply respond with "No apparent security vulnerabilities found". Keep it under 50 words.`
      },
      summaryAnalysis: {
        prompt: `Based on the security analysis results, generate a professional security assessment report:

1. **Security Risk Overview**
   - Risk level distribution
   - Vulnerability type statistics
   - OWASP Top 10 comparison
   - Overall security score

2. **Vulnerability Details**
   - Vulnerability description
   - Impact scope
   - Exploitation difficulty
   - Severity level

3. **Risk Assessment**
   - CVSS scoring
   - Attack vector analysis
   - Threat model
   - Risk exposure surface

4. **Remediation Plan**
   - Emergency fix recommendations
   - Long-term protection strategy
   - Best practices guide
   - Security hardening plan

5. **Security Governance**
   - Secure development process
   - Code review checklist
   - Continuous monitoring plan
   - Incident response plan`
      }
    },
    "API Documentation": {
      name: "API Documentation",
      singlePageAnalysis: {
        prompt: `Please analyze this code file and extract all defined API interfaces. Include:
1. Each API endpoint's path, request method (GET/POST etc.), and functionality description.
2. Request parameters, including parameter names, types, required status, and default values.
3. Response format, including field names, types, and descriptions.
4. Error codes and their meanings.
If none found, simply respond with "No API interfaces found".`
      },
      summaryAnalysis: {
        prompt: `Based on the extracted API interface information, generate an API documentation. Include:
1. **API Interface List**: List all API interfaces with paths, methods, functionality descriptions, request parameters, and response data formats.
2. **Request Examples**: Provide request examples for each API interface, including method, path, and parameters.
3. **Response Examples**: Provide response examples showing the data format and fields.
4. **Error Handling**: List all possible error codes and explain their meanings and handling approaches.`
      }
    },
    "User Behavior Analysis": {
      name: "User Behavior Analysis",
      singlePageAnalysis: {
        prompt: `Please analyze this code file, extract its functional modules, and predict possible user behaviors. Include:
1. Main functional modules and their purposes.
2. Possible user operation paths and behavior flows when using these features.
3. Are there any user experience pain points, such as complex functionality or unfriendly interactions?
4. Are there any user behavior prediction or logging functions? How do users interact with the system?
5. Are there any processes that could be simplified or optimized to improve user experience?`
      },
      summaryAnalysis: {
        prompt: `Based on the extracted user behavior information, generate a user behavior analysis report. Include:
1. **User Behavior Flow**: Show task execution flows in the system, including key feature usage paths.
2. **User Pain Point Analysis**: Analyze potential user pain points, such as functionality complexity or unintuitive interactions.
3. **Optimization Suggestions**: Based on behavior analysis, provide suggestions for feature optimization and process improvements.
4. **Data Tracking**: List how user behavior is tracked and applied (e.g., event logs, analytics tools).`
      }
    }
  },
  ja: {
    "要件文書": {
      name: "要件文書",
      singlePageAnalysis: {
        prompt: `このコードファイルを分析し、以下の点を提供してください：
1. 主要機能と目的（50文字以内）
2. 主要機能モジュールのリスト
3. 入出力とシステム相互作用方式
4. 主要技術依存関係
簡潔に保ち、合計文字数は100文字以内にしてください。`
      },
      summaryAnalysis: {
        prompt: `各ファイルの機能概要に基づき、専門的な製品要件文書（PRD）を作成してください。文書構成：

1. **製品概要**
   - 製品背景と価値
   - ターゲットユーザー層
   - 核心的価値提案
   - 市場ポジショニング

2. **機能仕様**
   - 核心機能モジュール
   - 機能アーキテクチャ図（Mermaidを使用）
   - 詳細機能説明
   - 機能優先度マトリックス

3. **ユーザーシナリオ**
   - 典型的なユーザーペルソナ
   - ユーザージャーニーマップ
   - 主要ユースケース

4. **技術アーキテクチャ**
   - システムアーキテクチャ図（Mermaidを使用）
   - 核心ビジネスフロー
   - 技術スタックリスト
   - 外部依存関係

5. **インターフェース仕様**
   - システム統合計画
   - データフロー説明
   - 主要インターフェース定義`
      }
    },
    "技術負債レポート": {
      name: "技術負債レポート",
      singlePageAnalysis: {
        prompt: `このコードファイルの技術負債を簡潔に分析してください：
1. コード品質の問題（コードの重複、複雑性）
2. パフォーマンスの懸念事項
3. ドキュメントの完全性
4. ベストプラクティスへの準拠
簡潔に保ち、合計文字数は50文字以内にしてください。`
      },
      summaryAnalysis: {
        prompt: `コード分析結果に基づき、専門的な技術負債評価レポートを生成してください：

1. **技術負債概要**
   - 負債分類統計
   - 深刻度分布
   - 影響範囲評価
   - 技術負債ヒートマップ

2. **詳細分析**
   - コード品質指標
   - パフォーマンスボトルネック分析
   - アーキテクチャリスク評価
   - セキュリティリスク調査

3. **優先度評価**
   - 評価マトリックス
   - ROI分析
   - 修正コスト見積もり
   - リスク影響度評価

4. **改善計画**
   - 短期最適化提案
   - 長期リファクタリング計画
   - 実装ステップ
   - 期待される効果分析

5. **モニタリング指標**
   - 主要指標定義
   - モニタリング計画
   - アラート閾値
   - 評価サイクル`
      }
    },
    "セキュリティレポート": {
      name: "セキュリティ分析レポート",
      singlePageAnalysis: {
        prompt: `このコードファイルのセキュリティ脆弱性を分析してください：
1. 一般的なセキュリティ脆弱性
2. データセキュリティの問題
3. アクセス制御の欠陥
明らかな問題が見つからない場合は、「明らかなセキュリティ脆弱性は見つかりませんでした」と回答してください。50文字以内に収めてください。`
      },
      summaryAnalysis: {
        prompt: `セキュリティ分析結果に基づき、専門的なセキュリティ評価レポートを生成してください：

1. **セキュリティリスク概要**
   - リスクレベル分布
   - 脆弱性タイプ統計
   - OWASP Top 10との比較
   - 全体的なセキュリティスコア

2. **脆弱性詳細**
   - 脆弱性の説明
   - 影響範囲
   - 悪用の難易度
   - 深刻度レベル

3. **リスク評価**
   - CVSSスコアリング
   - 攻撃ベクトル分析
   - 脅威モデル
   - リスク露出面

4. **改善計画**
   - 緊急修正推奨事項
   - 長期的保護戦略
   - ベストプラクティスガイド
   - セキュリティ強化計画

5. **セキュリティガバナンス**
   - セキュア開発プロセス
   - コードレビューチェックリスト
   - 継続的モニタリング計画
   - インシデント対応計画`
      }
    },
    "APIドキュメント": {
      name: "APIドキュメント",
      singlePageAnalysis: {
        prompt: `このコードファイルを分析し、定義されているすべてのAPIインターフェースを抽出してください。含めるべき内容：
1. 各APIエンドポイントのパス、リクエストメソッド（GET/POSTなど）、および機能説明。
2. リクエストパラメータ（パラメータ名、型、必須状態、デフォルト値を含む）。
3. レスポンス形式（フィールド名、型、説明を含む）。
4. エラーコードとその意味。
見つからない場合は、「APIインターフェースは見つかりませんでした」と回答してください。`
      },
      summaryAnalysis: {
        prompt: `抽出したAPIインターフェース情報に基づき、APIドキュメントを生成してください。含めるべき内容：
1. **APIインターフェースリスト**：すべてのAPIインターフェースをパス、メソッド、機能説明、リクエストパラメータ、レスポンスデータ形式とともにリスト化。
2. **リクエスト例**：各APIインターフェースのリクエスト例（メソッド、パス、パラメータを含む）を提供。
3. **レスポンス例**：データ形式とフィールドを示すレスポンス例を提供。
4. **エラー処理**：可能性のあるすべてのエラーコードとその意味、対処方法を説明。`
      }
    },
    "ユーザー行動分析": {
      name: "ユーザー行動分析",
      singlePageAnalysis: {
        prompt: `このコードファイルを分析し、機能モジュールを抽出し、想定されるユーザー行動を予測してください。含めるべき内容：
1. 主要機能モジュールとその目的。
2. これらの機能を使用する際の想定されるユーザー操作パスと行動フロー。
3. 機能の複雑さや操作の分かりにくさなど、ユーザー体験の問題点はありますか？
4. ユーザー行動予測やログ記録の機能はありますか？ユーザーはシステムとどのように相互作用しますか？
5. ユーザー体験を向上させるために簡素化または最適化できるプロセスはありますか？`
      },
      summaryAnalysis: {
        prompt: `抽出したユーザー行動情報に基づき、ユーザー行動分析レポートを生成してください。含めるべき内容：
1. **ユーザー行動フロー**：システムでのタスク実行フロー（主要機能の使用パスを含む）を示す。
2. **ユーザー問題点分析**：機能の複雑さや直感的でない操作など、潜在的なユーザーの問題点を分析。
3. **最適化提案**：行動分析に基づき、機能最適化とプロセス改善の提案を提供。
4. **データトラッキング**：ユーザー行動の追跡方法とその適用（イベントログ、分析ツールなど）をリスト化。`
      }
    }
  }
};

export function GlobalAnalysisPromptTemplatesDialog({ children }: GlobalAnalysisPromptTemplatesDialogProps) {
  const { t } = useTranslation();
  const { addAnalysis } = useGlobalAnalysisStore();
  const [previewTemplate, setPreviewTemplate] = useState<GlobalAnalysisPromptTemplate | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const handleAddAnalysis = (templateId: string, template: GlobalAnalysisPromptTemplate) => {
    addAnalysis({
      name: template.name,
      singlePageAnalysis: {
        modelId: "", // 用户需要在添加后配置模型
        prompt: template.singlePageAnalysis.prompt,
      },
      summaryAnalysis: {
        modelId: "", // 用户需要在添加后配置模型
        prompt: template.summaryAnalysis.prompt,
      },
    });
    setOpen(false);
  };

  const handlePreview = (template: GlobalAnalysisPromptTemplate) => {
    setPreviewTemplate(template);
    setIsPreviewOpen(true);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[1000px] h-[700px] flex flex-col">
          <DialogHeader className="text-center">
            <DialogTitle>{t('codeview.globalAnalysis.promptTemplates')}</DialogTitle>
          </DialogHeader>
          
          <div className="flex-1 flex flex-col items-center mt-4">
            <Tabs defaultValue="zh" className="w-full flex flex-col items-center">
              <TabsList>
                <TabsTrigger value="zh">{t('codeview.promptTemplates.chinese')}</TabsTrigger>
                <TabsTrigger value="en">{t('codeview.promptTemplates.english')}</TabsTrigger>
                <TabsTrigger value="ja">{t('codeview.promptTemplates.japanese')}</TabsTrigger>
              </TabsList>

              {Object.entries(templates).map(([lang, langTemplates]) => (
                <TabsContent key={lang} value={lang} className="w-full mt-4">
                  <ScrollArea className="h-[480px] pr-4">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(langTemplates).map(([templateId, template]) => (
                        <Card key={templateId} className="flex flex-col">
                          <CardContent className="flex-1 p-4">
                            <h3 className="font-medium mb-2">{template.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.singlePageAnalysis.prompt}
                            </p>
                          </CardContent>
                          <CardFooter className="flex gap-2 p-4 pt-0">
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex-1 transition-transform hover:scale-105 active:scale-95"
                              onClick={() => handlePreview(template)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              {t('codeview.promptTemplates.preview')}
                            </Button>
                            <Button 
                              size="sm"
                              className="flex-1 transition-transform hover:scale-105 active:scale-95"
                              onClick={() => handleAddAnalysis(templateId, template)}
                            >
                              {t('codeview.promptTemplates.use')}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">{t('codeview.globalAnalysis.singlePage.prompt')}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewTemplate?.singlePageAnalysis.prompt}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">{t('codeview.globalAnalysis.summary.prompt')}</h4>
              <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                {previewTemplate?.summaryAnalysis.prompt}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 