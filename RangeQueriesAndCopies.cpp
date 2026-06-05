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
const ll mxn = 6000000;
ll arr[mxn];
ll toto = 0;
struct node{
    ll ls,rs;
    ll sum;
}seg[mxn];
struct SEG{
    ll clone(ll old){
        ll now = ++toto;
        seg[now] = seg[old];
        return now;
    }
    ll build(ll l,ll r){
        ll now = ++toto;
        if(l == r){
            seg[now].sum = arr[l];
            return now;
        }
        seg[now].ls = build(l,mid);
        seg[now].rs = build(mid+1,r);
        seg[now].sum = seg[seg[now].ls].sum + seg[seg[now].rs].sum;
        return now;
    }
    ll modify(ll old,ll l,ll r,ll p,ll v){
        ll now = clone(old);

        if(l == r){
            seg[now].sum = v;
            return now;
        }
        if(p <= mid) seg[now].ls = modify(seg[old].ls,l,mid,p,v);
        else seg[now].rs = modify(seg[old].rs,mid+1,r,p,v);
        seg[now].sum = seg[seg[now].ls].sum + seg[seg[now].rs].sum;
        return now;
    }
    ll query(ll now,ll l,ll r,ll ql,ll qr){
        if(ql > r || qr < l) return 0;
        if(ql <= l && r <= qr) return seg[now].sum;
        return query(seg[now].ls,l,mid,ql,qr) + query(seg[now].rs,mid+1,r,ql,qr);
    }
}Seg;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    ll n,q;
    cin >> n >> q;
    foo(i,1,n) cin >> arr[i];
    vector<ll> roots;
    roots.pb(0);
    roots.pb(Seg.build(1,n));

    while(q--){
        ll t;
        cin >> t;
        if(t == 1){
            ll k,a,x;
            cin >> k >> a >> x;
            roots[k] = Seg.modify(roots[k],1,n,a,x);
        }
        else if(t == 2){
            ll k,a,b;
            cin >> k >> a >> b;
            cout << Seg.query(roots[k],1,n,a,b) << '\n';
        }
        else {
            ll k;
            cin >> k;
            roots.pb(roots[k]);
        }
    }
}