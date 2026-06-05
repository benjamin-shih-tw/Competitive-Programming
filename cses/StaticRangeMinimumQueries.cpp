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
#define mid (l+r)/2
const int mxn = 2e5+10;
int arr[mxn];
int n,q;
struct SEG{
    int seg[mxn*4];
    void build(int now,int l,int r){
        if(l == r){
            seg[now] = arr[l];
            return;
        }
        build(now*2,l,mid);
        build(now*2+1,mid+1,r);
        seg[now] = min(seg[now*2],seg[now*2+1]);
    }
    int query(int now,int l,int r,int ql,int qr){
        if(ql > r || qr < l) return 2e9;
        if(ql <= l && r <= qr){
            return seg[now];
        }
        return min(query(now*2,l,mid,ql,qr),query(now*2+1,mid+1,r,ql,qr));
    }
}seg;
int main(){
    ios::sync_with_stdio(0);cin.tie(0);
    cin >> n >> q;
    foo(i,1,n) cin >> arr[i];
    seg.build(1,1,n);
    while(q--){
        int a,b;
        cin >> a >> b;
        cout << seg.query(1,1,n,a,b) << '\n';
    }
}