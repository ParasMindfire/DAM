export interface ILoginFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
}

export interface IRegisterFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  redirectPath?: string;
}
