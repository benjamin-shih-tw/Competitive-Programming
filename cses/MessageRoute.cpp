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
int n,m;
int dis[mxn];
vector<int> path;
void dijkstra(int start){
    fill(dis,dis+n+1,INT_MAX);
    priority_queue<pii,vector<pii>,greater<>> pq;
    dis[start] = 0;
    pq.push({dis[start],start});
    while(SZ(pq)){
        auto [d,u] = pq.top(); pq.pop();
        if(d > dis[u]) continue;
        for(auto nxt : g[u]){
            int w = 1;
            if(dis[nxt] > dis[u] + w){
                dis[nxt] = dis[u] + w;
                pq.push({dis[nxt],nxt});
            }
        }
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> n >> m;
    while(m--){
        int u,v;
        cin >> u >> v;
        g[u].pb(v);
        g[v].pb(u);
    }
    dijkstra(1);
    // find path
    if(dis[n] == INT_MAX){
        cout << "IMPOSSIBLE";
        exit(0);
    }
    cout << dis[n]+1 << '\n';
    int now = n;
    while(now != 1){
        for(auto nxt : g[now]){
            if(dis[nxt] == dis[now] - 1){
                now = nxt;
                path.pb(now);
            }
        }
    }
    reverse(ALL(path));
    path.pb(n);
    for(auto x : path){
        cout << x << ' ';
    }
}