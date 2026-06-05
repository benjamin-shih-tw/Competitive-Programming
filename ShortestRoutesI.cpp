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
vector<pii> g[mxn];
ll dis[mxn];
 
ll n,m;
void dijkstra(ll start){
    priority_queue<pii,vector<pii>,greater<>> pq;
    fill(dis,dis+n+1,LLONG_MAX/4);
    dis[start] = 0;
    pq.push({dis[start],start});
 
    while(SZ(pq)){
        auto [d,now] = pq.top(); pq.pop();
        if(d > dis[now]) continue;
        for(auto [nxt,w] : g[now]){
            if(dis[nxt] > dis[now] + w){
                dis[nxt] = dis[now] + w;
                pq.push({dis[nxt],nxt});
            }
        }
    }
}
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> n >> m;
    while(m--){
        ll u,v,w;
        cin >> u >> v >> w;
        g[u].pb({v,w});
    }
    dijkstra(1);
    foo(i,1,n){
        cout << dis[i] << ' ';
    }
}
