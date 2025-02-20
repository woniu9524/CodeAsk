import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useModelStore, ModelConfig } from "@/store/useModelStore";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage } from "@langchain/core/messages";
import { toast } from "sonner";

// 定义模型表单数据类型，排除 id 和 enabled 字段
type ModelFormData = Omit<ModelConfig, 'id' | 'enabled'>;

// 定义组件属性接口
interface ModelEditDialogProps {
  children: React.ReactNode; // 触发对话框的子组件
  model: ModelConfig; // 当前要编辑的模型配置
}

export function ModelEditDialog({ children, model }: ModelEditDialogProps) {
  // 控制对话框打开/关闭状态
  const [open, setOpen] = React.useState(false);

  // 使用 react-hook-form 创建表单，设置默认值为当前模型配置
  const { register, handleSubmit } = useForm<ModelFormData>({
    defaultValues: {
      name: model.name, // 模型名称
      apiKey: model.apiKey, // API 密钥
      baseUrl: model.baseUrl, // 基础 URL
      temperature: model.temperature, // 模型温度（创造力）
      maxContextTokens: model.maxContextTokens, // 最大上下文 Token 数
      maxOutputTokens: model.maxOutputTokens, // 最大输出 Token 数
      concurrency: model.concurrency ?? 1, // 并发数，默认为 1
    },
  });
  
  // 获取模型存储中的更新模型方法
  const { updateModel } = useModelStore();
  
  // 国际化翻译钩子
  const { t } = useTranslation();

  // 提交表单时的处理函数
  const onSubmit = (data: ModelFormData) => {
    // 使用模型 ID 和更新的数据调用更新模型方法
    updateModel(model.id, data);
    // 关闭对话框
    setOpen(false);
  };

  // 添加测试函数
  const handleTest = async (formData: ModelFormData) => {
    try {
      const chat = new ChatOpenAI({
        openAIApiKey: formData.apiKey,
        modelName: formData.name,
        temperature: formData.temperature,
        maxTokens: formData.maxOutputTokens,
        maxConcurrency: formData.concurrency,
        configuration: {
          baseURL: formData.baseUrl,
        },
      });

      const response = await chat.invoke([
        new HumanMessage("回复Let's go!，不要说其他内容"),
      ]);

      toast.success(t('codeview.model.testSuccess', { content: response.content }));
    } catch (error: any) {
      toast.error(t('codeview.model.testFailed', { error: error.message }));
    }
  };

  return (
    // 使用可控制打开/关闭的对话框组件
    <Dialog open={open} onOpenChange={setOpen}>
      {/* 对话框触发器，使用传入的子组件 */}
      <DialogTrigger asChild>{children}</DialogTrigger>
      
      {/* 对话框内容 */}
      <DialogContent className="sm:max-w-[425px]">
        {/* 对话框头部 */}
        <DialogHeader>
          <DialogTitle>{t('codeview.model.edit')}</DialogTitle>
        </DialogHeader>
        
        {/* 模型编辑表单 */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* 模型名称输入 */}
          <div className="space-y-2">
            <Label htmlFor="name">{t('codeview.model.name')}</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          
          {/* API 密钥输入（密码类型） */}
          <div className="space-y-2">
            <Label htmlFor="apiKey">{t('codeview.model.apiKey')}</Label>
            <Input id="apiKey" type="password" {...register("apiKey", { required: true })} />
          </div>
          
          {/* 基础 URL 输入 */}
          <div className="space-y-2">
            <Label htmlFor="baseUrl">{t('codeview.model.baseUrl')}</Label>
            <Input id="baseUrl" {...register("baseUrl", { required: true })} />
          </div>
          
          {/* 模型温度输入（0-2 范围的浮点数） */}
          <div className="space-y-2">
            <Label htmlFor="temperature">{t('codeview.model.temperature')}</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              min="0"
              max="2"
              {...register("temperature", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>
          
          {/* 最大上下文 Token 数输入 */}
          <div className="space-y-2">
            <Label htmlFor="maxContextTokens">{t('codeview.model.maxContextTokens')}</Label>
            <Input
              id="maxContextTokens"
              type="number"
              {...register("maxContextTokens", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>
          
          {/* 最大输出 Token 数输入 */}
          <div className="space-y-2">
            <Label htmlFor="maxOutputTokens">{t('codeview.model.maxOutputTokens')}</Label>
            <Input
              id="maxOutputTokens"
              type="number"
              {...register("maxOutputTokens", {
                required: true,
                valueAsNumber: true,
              })}
            />
          </div>
          
          {/* 并发数输入（最小为 1） */}
          <div className="space-y-2">
            <Label htmlFor="concurrency">{t('codeview.model.concurrency')}</Label>
            <Input
              id="concurrency"
              type="number"
              min="1"
              {...register("concurrency", {
                required: true,
                valueAsNumber: true,
                min: 1,
              })}
            />
          </div>
          
          {/* 按钮组 */}
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => handleSubmit(handleTest)()}
              className="flex-1"
            >
              {t('codeview.model.test')}
            </Button>
            <Button type="submit" className="flex-1">{t('codeview.model.save')}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 