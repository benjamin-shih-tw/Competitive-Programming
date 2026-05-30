#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<ll,ll>
#define SZ(x) ((ll)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(ll i = 0LL ; i < (n) ; i++)
#define foo(i,a,b) for(ll i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
#define mid (l+r)/2
const ll mxn = 2e5+10LL;
struct node{
    ll sum,pref,suff,ans;
}seg[mxn*4];
ll arr[mxn];
struct SEG{
    node merge(node l,node r){
        node res;
        res.sum = l.sum + r.sum;
        res.pref = max(l.pref,l.sum + r.pref);
        res.suff = max(r.suff,r.sum + l.suff);
        res.ans = max({l.ans,r.ans,l.suff+r.pref});
        return res;
    }
    node make_node(ll val){
        return{
            val,max(0LL,val),max(0LL,val),max(0LL,val)
        };
    }
    void build(ll now,ll l,ll r){
        if(l == r){
            seg[now] = make_node(arr[l]);
            return;
        }
        build(now*2,l,mid);
        build(now*2+1,mid+1,r);
        seg[now] = merge(seg[now*2],seg[now*2+1]);
    }
    void modify(ll now,ll l,ll r,ll p,ll v){
        if(l == r){
            seg[now] = make_node(v);
            return;
        }
        if(p <= mid) modify(now*2,l,mid,p,v);
        else modify(now*2+1,mid+1,r,p,v);
        seg[now] = merge(seg[now*2],seg[now*2+1]);
    }
}Seg;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll n,q;
    cin >> n >> q;
    foo(i,1,n) cin >> arr[i];
    Seg.build(1,1,n);
    while(q--){
        ll a,b;
        cin >> a >> b;
        Seg.modify(1,1,n,a,b);
        cout << seg[1].ans << '\n';
    }
}