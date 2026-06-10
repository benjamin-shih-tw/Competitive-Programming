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
const int mxn = 1e5+10;
vector<int> g[mxn];
bool vis[mxn];
void dfs(int now,int par){
    vis[now] = 1;
    for(auto nxt : g[now]){
        if(nxt == par) continue;
        if(!vis[nxt]) dfs(nxt,now);
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    int n,m;
    cin >> n >> m;
    while(m--){
        int u,v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    vector<int> idx;
    foo(i,1,n){
        if(!vis[i]) { dfs(i,0); idx.pb(i); }
    }
    cout << SZ(idx) - 1 << '\n';
    auto s = idx.back();
    idx.pop_back();
    for(auto x : idx){
        cout << x << ' ' << s << '\n';
    }

}