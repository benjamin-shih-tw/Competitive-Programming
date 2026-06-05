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
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n,x;
    cin >> n >> x;
    vector<int> v(n);
    fo(i,n) cin >> v[i];
    vector<int> dp(x+1,INT_MAX);
    dp[0] = 0;
    foo(i,1,x){
        fo(j,n){
            if(i >= v[j] && dp[i - v[j]] != INT_MAX)
                dp[i] = min(dp[i] , dp[i-v[j]] + 1);
        }
    }

    cout << (dp[x] == INT_MAX ? -1 : dp[x]);
}