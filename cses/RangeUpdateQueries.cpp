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
#define mid (l+r)/2
const ll mxn = 2e5+10;
ll arr[mxn];
struct SEG{
    ll seg[mxn*4];
    ll lazy[mxn*4];

    void build(ll now,ll l,ll r){
        if(l == r){
            seg[now] = arr[l];
            return;
        }
        build(now*2,l,mid);
        build(now*2+1,mid+1,r);
    }
    void apply(ll now,ll l,ll r,ll v){
        seg[now] += v * (r - l + 1);
        lazy[now] += v;
    }
    void pd(ll now,ll l,ll r){
        if(lazy[now]){
            apply(now*2,l,mid,lazy[now]);
            apply(now*2+1,mid+1,r,lazy[now]);
            lazy[now] = 0;
        }
    }
    void modify(ll now,ll l,ll r,ll ql,ll qr,ll v){
        if(qr < l || ql > r) return;
        if(ql <= l && r <= qr){
            apply(now,l,r,v);
            return;
        }
        pd(now,l,r);
        modify(now*2,l,mid,ql,qr,v);
        modify(now*2+1,mid+1,r,ql,qr,v);
    }   
    ll query(ll now,ll l,ll r,ll p){
        if(l == r){
            return seg[now];
        }
        pd(now,l,r);
        if(p <= mid){
            return query(now*2,l,mid,p);
        }
        else{
            return query(now*2+1,mid+1,r,p);
        }
    }
}seg;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll n,q;
    cin >> n >> q;
    foo(i,1,n) cin >> arr[i];
    seg.build(1,1,n);
    while(q--){
        ll t;
        cin >> t;
        if(t == 1){
            ll a,b,u;
            cin >> a >> b >> u;
            seg.modify(1,1,n,a,b,u);
        }
        else{
            ll k;
            cin >> k;
            cout << seg.query(1,1,n,k) << '\n';
        }
    }
}