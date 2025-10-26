export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data: T | null;
}


// ------------------ User related types --------------------------


export interface UserRegisterPayload {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
}

export interface UserResponse {
	status: boolean;
	message: string;
	user?: unknown;
}

export interface UserLoginPayload {
	username: string;
	password: string;
}

export interface ResetPasswordPayload {
	token: string;
	password: string;
	confirmPassword: string;
}

export interface meResponse {
	status: boolean;
	message?: string;
	user: any;
}


// ------------------ Dashboard / Features --------------------------


export interface FeatureTier {
	maxQuestions: number;
	credits: number;
}

export interface FeatureItem {
	id: string;
	title: string;
	description?: string;
	route: string;
	tiers: FeatureTier[];
}

export interface DashboardData {
	credits: number;
	features: FeatureItem[];
}

