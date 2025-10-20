export const AuthHelper = {
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('linkedin_account_ids');
  },
};

export default AuthHelper;
