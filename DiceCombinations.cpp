#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(int i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(int i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
const int mod = 1e9+7;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n; cin >> n;
    vector<int> dp(n+1,0);
    dp[0] = 1;
    foo(i,1,n) foo(j,1,6) if(i >= j) dp[i] = (dp[i] + dp[i-j]) % mod;
    cout << dp[n];
}