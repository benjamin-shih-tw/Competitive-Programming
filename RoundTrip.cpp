#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<ll,ll>
#define SZ(x) ((ll)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(ll i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(ll i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
const ll mxn = 2e5+10;
vector<ll> g[mxn];
bool vis[mxn];
ll p[mxn];
void dfs(ll now,ll par){
    vis[now] = 1;
    p[now] = par;
 
    for(auto nxt : g[now]){
        if(nxt == par) continue;
        if(vis[nxt]){
            vector<ll> cycle;
 
            ll cur = now;
            cycle.pb(nxt);
 
            while(cur != nxt){
                cycle.pb(cur);
                cur = p[cur];
            }
            cycle.pb(nxt);
 
            reverse(ALL(cycle));
 
            cout << SZ(cycle) << '\n';
            for(auto x : cycle) cout << x << ' ';
            exit(0);
        }
        dfs(nxt,now);
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll n,m;
    cin >> n >> m;
    while(m--){
        ll u,v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    foo(i,1,n){
        if(!vis[i]) dfs(i,0);
    }
    cout << "IMPOSSIBLE";
}