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
const int mxn = 2e5+10;
vector<int> g[mxn];
int n,m;
bool vis[mxn];
int cnt = 0;
void dfs(int now,int par){
    for(auto nxt : g[now]){
        if(nxt == par) continue;
        dfs(nxt,now);
        if(!vis[nxt] && !vis[now]){
            vis[nxt] = 1;
            vis[now] = 1;
            cnt++;
        }
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> n;
    n--;
    while(n--){
        int u,v; cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    dfs(1,0);
    cout << cnt;    
}
