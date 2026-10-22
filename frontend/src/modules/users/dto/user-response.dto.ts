export interface UserResponseDto {
  id: string;
  name: string;
  email: string;
  active: boolean;
  lastAccessAt: string | null;
}
