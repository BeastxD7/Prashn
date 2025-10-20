export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data: T | null;
}

export interface UserRegisterPayload {
	firstName: string;
	lastName: string;
	username: string;
	email: string;
	password: string;
}

export interface UserResponse {
	status:boolean;
	message:string;
	user:string;
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


export interface DashboardResponse {
	metrics: Record<string, number>;
	highlights?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface EventItem {
	id: string;
	title: string;
	description?: string;
	createdAt: string;
	[key: string]: unknown;
}

export interface EventResponse {
	events: EventItem[];
	total: number;
}

export interface LinkedInCredentialsPayload {
	username: string;
	password: string;
	otp?: string;
	proxyId?: string;
}

export interface LinkedInCredentialsResponse {
	id: string;
	username: string;
	createdAt: string;
	[key: string]: unknown;
}

export interface CampaignFilter extends Record<string, unknown> {
	search?: string;
	status?: string;
	ownerId?: string;
	limit?: number;
	page?: number;
	leadId?: string;
	campaignId?: string;
}

export interface CampaignSummary {
	id: string;
	name: string;
	status: string;
	createdAt: string;
	[key: string]: unknown;
}

export interface GetCampaignListResponse {
	items: CampaignSummary[];
	total: number;
}

export interface CampaignStep {
	id: string;
	name: string;
	order: number;
	[key: string]: unknown;
}

export interface GetCampaignDetails {
	id: string;
	name: string;
	status: string;
	steps: CampaignStep[];
	[key: string]: unknown;
}

export interface WorkflowNodeData {
	label?: string;
	type?: string;
	[key: string]: unknown;
}

export interface WorkflowNode<T = WorkflowNodeData> {
	id: string;
	data: T;
	position: {
		x: number;
		y: number;
	};
	[key: string]: unknown;
}

export interface WorkflowEdge {
	id: string;
	source: string;
	target: string;
	label?: string;
	[key: string]: unknown;
}
