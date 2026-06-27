#pragma GCC optimize("O3,unroll-loops")
#include <bits/stdc++.h>
#pragma GCC target("avx2,bmi,bmi2,lzcnt,popcnt")
using namespace std;
using ll = long long;
#define pii pair<int,int>
#define SZ(x) ((int)(x).size())
#define ALL(x) (x).begin(),(x).end()
#define fo(i,n) for(ll i = 0 ; i < (n) ; i++)
#define foo(i,a,b) for(ll i = (a) ; i <= (b) ; i++)
#define F first
#define S second
#define pb push_back
template<class T> bool chmax(T &a, const T &b) { return a < b ? (a = b, 1) : 0; }
template<class T> bool chmin(T &a, const T &b) { return a > b ? (a = b, 1) : 0; }
#ifndef ONLINE_JUDGE
#define dbg(x) cerr << "\033[1;33m[ " << #x << " = " << (x) << " ]\033[0m\n"
#else
#define dbg(x)
#endif
struct pt{ ll x,y; };
pt operator+(pt a,pt b) { return {a.x + b.x , a.y + b.y}; }
pt operator-(pt a,pt b) { return {a.x - b.x , a.y - b.y}; }
ll cross(pt a,pt b) {return a.x * b.y - a.y * b.x; }
void print128(__int128 n){
    if(!n) { cout << 0; return; }
    if(n < 0) { cout << "-"; n = -n; }
    string s;
    while(n > 0){
        s += (char)('0' + (n % 10)); n /= 10;
    }
    reverse(ALL(s));
    cout << s;
}
void solve() {
    ll n,m;
    cin >> n >> m;
    vector<pt> p(n),q(m);
    ll pi = 0,qi = 0;
    fo(i,n){
        cin >> p[i].x >> p[i].y;
        if(p[i].y < p[pi].y || (p[i].y == p[pi].y and p[i].x < p[pi].x)) pi = i;
    }
    fo(i,m){
        cin >> q[i].x >> q[i].y;
        if(q[i].y < q[qi].y || q[i].y == q[qi].y and q[i].x < q[qi].x) qi = i;
    }
    rotate(p.begin(),p.begin() + pi , p.end());
    rotate(q.begin(),q.begin() + qi, q.end());
    p.pb(p[0]);
    q.pb(q[0]);
    vector<pt> ans;
    pt now = p[0] + q[0];
    ans.pb(now);
    ll i = 0,j = 0;
    while(i < n || j < m){
        pt vp = p[i+1] - p[i];
        pt vq = q[j+1] - q[j];

        if(i == n || (j < m and cross(vp,vq) < 0)){
            now = now + vq;
            j++;
        }
        else{
            now = now + vp;
            i++;
        }
        ans.pb(now);
    }
    __int128 area2 = 0;
    for(ll k = 0 ; k < ans.size()-1 ; k++){
        area2 += (__int128) ans[k].x * ans[k+1].y - (__int128)ans[k].y * ans[k+1].x;
    }
    if(area2 < 0) area2 = -area2;
    print128(area2/2);
    if(area2 % 2) cout << ".5";
    cout << '\n';
}
int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    ll t = 1;
    // cin >> t;
    while (t--) {
        solve();
    }
    return 0;
}