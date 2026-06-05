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
struct node{
    ll sum,tagadd,tagset;
}seg[mxn*4];
struct SEG{
    void pull(ll now){
        seg[now].sum = seg[now*2].sum + seg[now*2+1].sum;
    }
    void build(ll now,ll l,ll r){
        if(l == r){
            seg[now].sum = arr[l];
            return;
        }
        build(now*2,l,mid);
        build(now*2+1,mid+1,r);
        pull(now);
    }
    void apply_set(ll now,ll l,ll r,ll v){
        seg[now].sum = (r - l + 1) * v;
        seg[now].tagadd = 0;
        seg[now].tagset = v;
    }
    void apply_add(ll now,ll l,ll r,ll v){
        seg[now].sum += (r - l + 1) * v;
        if(seg[now].tagset){
            seg[now].tagset += v;
        }
        else{
            seg[now].tagadd += v;
        }
    }
    void pd(ll now,ll l,ll r){
        if(seg[now].tagset){
            apply_set(now*2,l,mid,seg[now].tagset);
            apply_set(now*2+1,mid+1,r,seg[now].tagset);
            seg[now].tagset = 0;
        }
        if(seg[now].tagadd){
            apply_add(now*2,l,mid,seg[now].tagadd);
            apply_add(now*2+1,mid+1,r,seg[now].tagadd);
            seg[now].tagadd = 0;
        }
    }
    void modify(ll now,ll l,ll r,ll ql,ll qr,ll v,ll type){
        if(ql > r || qr < l) return;
        if(ql <= l && r <= qr){
            if(type == 1) apply_add(now,l,r,v);
            else apply_set(now,l,r,v);
            return;
        }
        pd(now,l,r);
        modify(now*2,l,mid,ql,qr,v,type);
        modify(now*2+1,mid+1,r,ql,qr,v,type);
        pull(now);
    }
    ll query(ll now,ll l,ll r,ll ql,ll qr){
        if(ql > r || qr < l) return 0;
        if(ql <= l && r <= qr) return seg[now].sum;
        pd(now,l,r);
        return query(now*2,l,mid,ql,qr) + query(now*2+1,mid+1,r,ql,qr);
    }
}Seg;

int main(){
ios::sync_with_stdio(0); cin.tie(0);
    ll n, q;
    cin >> n >> q;
    foo(i, 1, n) cin >> arr[i];
    Seg.build(1, 1, n);
    
    while(q--){
        ll type, a, b;
        cin >> type >> a >> b;
        if(type == 1 || type == 2){
            ll x;
            cin >> x;
            Seg.modify(1, 1, n, a, b, x, type);
        } else {
            cout << Seg.query(1, 1, n, a, b) << '\n';
        }
    }
    return 0;
}